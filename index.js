/*jslint node: true */

'use strict';

require('app-module-path').addPath(__dirname + '/');

const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const twig = require('twig');
const config = require('config');
const _ = require('lodash');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const async = require('async');

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// DATA BASE ========================
var hosts = _.join(_.flatMap(config.get('mongo.hosts'), function(o) {
    return o.host + ':' + o.port;
}), ',');

var mongoPath = 'mongodb://' + config.mongo.user + ':' + config.mongo.password + '@' + hosts + '/' + config.mongo.bdd;

console.log(mongoPath);

if (config.mongo.replicaSet === "Prod") {
  mongoPath += '?replicaSet=' + config.mongo.replicaSet;
}

mongoose.Promise = require('bluebird');
mongoose.connect(mongoPath);
mongoose.set('debug', config.debug);

var db = mongoose.connection;

db.on('error', function() {
    console.error.bind(console, 'connection error:');
});
db.once('open', function() {
    console.log('Database connected !');
});
// ==================================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: config.get('secret'),
    saveUninitialized: true, // don't create session until something stored
    resave: false, //don't save session if unmodified
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());

// RENDER OVERRIDE
app.use(function (req, res, next) {
  req.io = io;
  req.view = {};
  req.view.currentPath = req.path;
  req.view.projectName = 'Helloworld';

  if(req.session) {
    req.view.session = req.session;
  }
  next();
});

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

var logout = require('routes/access');
app.use(logout);
var live = require('routes/live');
app.use('/live', live);
var dashboard = require('routes/dashboard');
app.use('/dashboard', dashboard);
var webhook = require('routes/webhook');
app.use('/webhook', webhook);

http.listen(config.get('port'), function() {
  console.log('Node app is running on port', config.get('port'));
});

const schedule = require('node-schedule');
const commentModel = require('models/comment');
var j = schedule.scheduleJob('*/5 * * * * *', function(){
  commentModel.count({'moderate': true, 'value.verb': { $ne: "deleted" }}, function (err, nb_comments) {
    io.sockets.emit('setcomments', nb_comments);
  });
});

module.exports = app;
