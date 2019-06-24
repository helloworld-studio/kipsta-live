const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const async = require('async');
const _  = require('lodash');
const fs = require('fs');
const config = require('config');

const commentModel = require('models/comment');

// Set Active Menu Item
router.use('/', function(req, res, next){
  req.view.nav = 'comments';
  next();
});

// ALL
router.get('/', function (req, res){
  req.view.limit = 50;
  req.view.pageLimit = 2;
  var query = {'selected': false, 'winner': false, 'moderate': true, 'value.verb': { $ne: "deleted" }};
  var skip = 0;
  if(req.query.page) {
    skip = req.view.limit*(req.query.page-1);
  }
  if(req.query.search) {
    req.view.search = req.query.search;
    query = {$text: {$search: req.query.search}, 'selected': false, 'winner': false, 'value.verb': { $ne: "deleted" }};
  }

  req.view.nb_pages = _.ceil(req.view.nb_comments/req.view.limit);
  req.view.current_page = 1;
  if(req.query.page) {
    req.view.current_page = req.query.page;
  }

  commentModel.find(query).skip(skip).limit(req.view.limit).sort({'value.post.updated_time': -1}).exec(function (err, comments) {
    req.view.pageTitle = 'Comments';
    req.view.pageName = 'Comments';
    req.view.comments = comments;

    res.render('dashboard/comments/all.twig', req.view);
  });
});

// SELECT
router.post('/select', function (req, res){
  var selected = false;
  if(req.body.selected == 'true') {
    selected = true;
  }

  async.waterfall([
    function(cb) {
      commentModel.update({'_id': req.body._id}, {$set: {'selected': selected }}, function (err, doc) {
        return cb(null);
      });
    },
    function(cb) {
      commentModel.findOne({'_id': req.body._id}, function(err, comment) {
        return cb(null, comment);
      });
    },
    function(comment, cb) {
      var user = {
        id: comment._id,
        name: comment.value.from.name,
        avatar: comment.value.from.profile_pic,
        isWinner: false
      };
      if(selected) {
        req.io.sockets.emit('select', user);
      } else {
        req.io.sockets.emit('removeSelect', user);
      }
      return cb(null);
    }
  ], function (err, result) {
    return res.status(200).json({
      status: 'success'
    });
  });
});

// WINNER
router.post('/editselect', function (req, res){
  var winner = false;
  if(req.body.winner == 'true') {
    winner = true;
  }

  async.waterfall([
    function(cb) {
      commentModel.update({'_id': req.body._id}, {$set: {'winner': winner }}, function (err, doc) {
        return cb(null);
      });
    },
    function(cb) {
      commentModel.findOne({'_id': req.body._id}, function(err, comment) {
        return cb(null, comment);
      });
    },
    function(comment, cb) {
      var user = {
        id: comment._id,
        name: comment.value.from.name,
        avatar: comment.value.from.profile_pic,
        isWinner: true
      };
      if(winner) {
        req.io.sockets.emit('setWinner', user);
      } else {
        req.io.sockets.emit('removeWinner', user);
      }
      return cb(null);
    }
  ], function (err, result) {
    return res.status(200).json({
      status: 'success'
    });
  });
});
router.post('/winner', function (req, res){
  var winner = false;
  if(req.body.winner == 'true') {
    winner = true;
  }

  async.waterfall([
    function(cb) {
      commentModel.update({'_id': req.body._id}, {$set: {'winner': winner }}, function (err, doc) {
        return cb(null);
      });
    },
    function(cb) {
      commentModel.findOne({'_id': req.body._id}, function(err, comment) {
        return cb(null, comment);
      });
    },
    function(comment, cb) {
      var user = {
        id: comment._id,
        name: comment.value.from.name,
        avatar: comment.value.from.profile_pic,
        isWinner: true
      };
      if(winner) {
        req.io.sockets.emit('addWinner', user);
      } else {
        req.io.sockets.emit('removeWinner', user);
      }
      return cb(null);
    }
  ], function (err, result) {
    return res.status(200).json({
      status: 'success'
    });
  });
});

module.exports = router;
