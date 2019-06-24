const express = require('express');
const async = require('async');
const _ = require('lodash');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const router = express.Router();

var comments = require('routes/comments');
var selected = require('routes/selected');
var winners = require('routes/winners');
var settings = require('routes/settings');

var commentModel = require('models/comment');
const settingModel = require('models/setting');

router.use(ensureLoggedIn('/login'), function (req, res, next) {
  req.view.user = req.user;
  next();
});

router.use(function(req, res, next){
  async.waterfall([
    function countUsers(cb) {
      commentModel.distinct('value.from.id').exec(function (err, users) {
        var nb_users = _.size(users);
        req.view.nb_users = nb_users;
        return cb();
      });
    },
    function countSelected(cb) {
      commentModel.count({'selected': true, 'winner': false}, function (err, nb_selected) {
        req.view.nb_selected = nb_selected;
        return cb();
      });
    },
    function countComments(cb) {
      commentModel.count({'selected': false, 'winner': false, 'moderate': true, 'value.verb': { $ne: "deleted" }}, function (err, nb_comments) {
        req.view.nb_comments = nb_comments;
        return cb();
      });
    },
    function countWinner(cb) {
      commentModel.count({'winner': true}, function (err, nb_winners) {
        req.view.nb_winners = nb_winners;
        return cb();
      });
    },
    function countEdited(cb) {
      commentModel.count({'value.verb': 'edited'}, function (err, nb_edited) {
        req.view.nb_edited = nb_edited;
        return cb();
      });
    },
    function countDeleted(cb) {
      commentModel.count({'value.verb': 'deleted'}, function (err, nb_deleted) {
        req.view.nb_deleted = nb_deleted;
        return cb();
      });
    },
    function countModerated(cb) {
      commentModel.count({'moderate': 'false'}, function (err, nb_moderated) {
        req.view.nb_moderated = nb_moderated;
        return cb();
      });
    }
  ],
  function () {
    next();
  });
});

router.get('/', function (req, res) {
  req.view.pageTitle = 'Dashboard';
  req.view.pageName = 'Dashboard';
  req.view.nav = 'dashboard';

  res.render('dashboard/home.twig', req.view);
});

router.get('/start', function (req, res) {
  req.io.sockets.emit('start');
  return res.redirect('/dashboard');
});

router.get('/stop', function (req, res) {
  req.io.sockets.emit('stop');
  return res.redirect('/dashboard');
});

router.use('/comments', comments);
router.use('/selected', selected);
router.use('/winners', winners);
router.use('/settings', settings);

module.exports = router;
