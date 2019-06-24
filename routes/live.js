const express = require('express');
const router = express.Router();

const config = require('config');

const commentModel = require('models/comment');

router.use('/', function (req, res, next) {
  req.view.url = config.get('url');
  return next();
});

router.get('/', function (req, res) {
  return res.render('live/index.twig', req);
});

module.exports = router;
