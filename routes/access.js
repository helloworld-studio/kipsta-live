const express = require('express');
const async = require('async');
const crypto = require('crypto');
const config = require('config');
const request = require('request');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

var router = express.Router();

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    request.post({url: config.get('api.url')+'/account/get', headers: { 'Authorization': 'Bearer '+ config.get('api.token') }, form: { email: username, password: password }}, function(err,httpResponse,body){
      var info = JSON.parse(body);
      if(info.active) {
        return done(null, info);
      } else {
        return done(null, false, { message: 'Incorrect username.' });
      }
    });
  }
));

router.get('/login', function (req, res) {
  res.render('access/login.twig', req);
});

router.post('/login', passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login' }));

router.get('/register', function (req, res) {
  res.render('access/register.twig', req);
});

router.post('/register', function (req, res) {
  request.post({url: config.get('api.url')+'/account/create', headers: { 'Authorization': 'Bearer '+ config.get('api.token') }, form: req.body }, function(err,httpResponse,body){
    res.redirect('/login');
  });
});

router.get('/reset', function (req, res) {
  res.render('access/reset.twig', req);
});

router.post('/reset', function (req, res) {
  request.post({url: config.get('api.url')+'/account/reset', headers: { 'Authorization': 'Bearer '+ config.get('api.token') }, form: req.body }, function(err,httpResponse,body){
    res.redirect('/login');
  });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
