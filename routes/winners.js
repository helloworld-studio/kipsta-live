const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const async = require('async');
const _  = require('lodash');
const fs = require('fs');
const config = require('config');

const commentModel = require('models/comment');
const settingModel = require('models/setting');

// Set Active Menu Item
router.use('/', function(req, res, next){
  req.view.nav = 'winners';
  next();
});

// ALL
router.get('/', function (req, res){
  req.view.limit = 50;
  req.view.pageLimit = 2;
  var query = {'winner': true};
  var skip = 0;
  if(req.query.page) {
    skip = req.view.limit*(req.query.page-1);
  }
  if(req.query.search) {
    req.view.search = req.query.search;
    query = {$text: {$search: req.query.search}, 'winner': true};
  }

  req.view.nb_pages = _.ceil(req.view.nb_winners/req.view.limit);
  req.view.current_page = 1;
  if(req.query.page) {
    req.view.current_page = req.query.page;
  }

  req.view.pageTitle = 'Winners';
  req.view.pageName = 'Winners';
  commentModel.find(query).skip(skip).limit(req.view.limit).sort({'value.post.updated_time': -1}).exec(function (err, comments) {
    req.view.comments = comments;
    res.render('dashboard/winners/all.twig', req.view);
  });
});

module.exports = router;
