const express = require('express');
const config = require('config');
const async = require('async');

const router = express.Router();

const facebook = require('helpers/facebook');

router.get('/', function (req, res) {
  return res.status(200).send('ok');
});

router.post('/', function (req, res) {
  async.each(req.body.changes, function (change, callback) {
    facebook.verif(change);
  });
});

module.exports = router;
