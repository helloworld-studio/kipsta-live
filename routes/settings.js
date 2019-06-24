const express = require('express');
const async = require('async');
const config = require('config');

const router = express.Router();

const settingModel = require('models/setting');

router.use('/', function(req, res, next){
  req.view.nav = 'settings';
  req.view.pageTitle = 'Settings';
  req.view.pageName = 'Settings';
  next();
});

router.get('/', function (req, res){
  settingModel.findOne({}, function (err, settings) {
    if(settings) {
      req.view.projectSetting = settings;
    }
    return res.render('dashboard/settings/index.twig', req.view);
  });
});

router.post('/edit/', function (req, res){
  if(!req.body._id) {
    async.waterfall([
      function(cb) {
        delete req.body._id;
        const new_setting = new settingModel(req.body);
        new_setting.save(function (err, new_setting) {
          return cb(null);
        });
      },
      function(cb) {
        settingModel.findOne({}, function (err, settings) {
          return cb(null, settings.phase);
        });
      },
      function(settings, cb) {
        req.io.sockets.emit('phase', settings);
        return cb(null);
      }
    ], function (err, result) {
      return res.redirect('/dashboard/settings');
    });
  } else {
    async.waterfall([
      function(cb) {
        settingModel.update({_id: req.body._id}, {$set: req.body}, function(err){
          return cb(null);
        });
      },
      function(cb) {
        settingModel.findOne({}, function (err, settings) {
          return cb(null, settings.phase);
        });
      },
      function(settings, cb) {
        req.io.sockets.emit('phase', settings);
        return cb(null);
      }
    ], function (err, result) {
      return res.redirect('/dashboard/settings');
    });
  }
});

module.exports = router;
