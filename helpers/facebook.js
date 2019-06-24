const config = require('config');
const async = require('async');
const _ = require('lodash');

const fb = require('fb');

const filter = require('helpers/facebook_filter');

const commentModel = require('models/comment');
const settingModel = require('models/setting');

var facebook = {
  verif: function (src) {
    console.log(src);
    async.parallel({
      feed: function(cb) {
        filter.feed(src, cb);
      },
      post: function(cb) {
        filter.post(src, cb);
      },
      comment: function(cb) {
        filter.comment(src, cb);
      }
    }, function(err, results) {
      if(!err) {
        if(results.post || results.organizer || results.comment) {
          return;
        } else {
          facebook.verb(src);
        }
      }
    });
  },
  verb: function (src) {
    switch (src.value.verb) {
      case 'add':
        facebook.message(src);
        break;
      case 'edited':
        facebook.edit(src);
        break;
      case 'remove':
        facebook.delete(src);
        break;
      default:
        return;
        break;
    }
  },
  message: function (src) {
    settingModel.findOne({}, function (err, setting) {
      if(setting) {
        fb.api('/' + src.value.comment_id, 'GET',{ access_token : setting.access_token }, function(data) {
          src.value.message = data.message;
          facebook.filters(src);
        });
      }
    });
  },
  filters: function (src) {
    async.parallel({
      organizer: function(cb) {
        filter.organizer(src, cb);
      }
    }, function(err, results) {
      if(!err) {
        if(results.organizer) {
          facebook.save(src, false);
        } else {
          facebook.save(src, true);
        }
      }
    });
  },
  save: function (src, status) {
    src.moderate = status;

    settingModel.findOne({}, function (err, setting) {
      if(setting) {
        fb.api('/' + src.value.from.id+'?fields=picture.type(large),id,name', 'GET',{ access_token : setting.access_token }, function(data) {
          src.value.from.profile_pic = data.picture.data.url;
          var permalink = _.split(src.value.comment_id, '_', 2);
          src.value.post.permalink_url = src.value.post.permalink_url+'&comment_id='+permalink[1];
          commentModel.create(src, function (err, doc) {
            if(!err && src.moderate) {
              facebook.phase(src);
            }
          });
        });
      } else {
        commentModel.create(src, function (err, doc) {
          if(!err && src.moderate) {
            facebook.phase(src);
          }
        });
      }
    });
  },
  edit: function (src) {

    var permalink = _.split(src.value.comment_id, '_', 2);
    src.value.post.permalink_url = src.value.post.permalink_url+'&comment_id='+permalink[1];
    commentModel.update({'value.comment_id': src.value.comment_id}, {$set: { 'value.verb': 'edited', 'value.message': src.value.message, 'selected': false, 'winner': false }}, function (err, doc) {
      if(!err) {
        facebook.phase(src);
      }
    });
  },
  delete: function (src) {
    commentModel.update({'value.comment_id': src.value.comment_id}, {$set: { 'value.verb': 'deleted', 'selected': false, 'winner': false }}, function (err, comment) {
      if(!err) {
        return;
      }
    });
  },
  phase: function (src) {
    return;
  }
};

module.exports = facebook;
