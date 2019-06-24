const config = require('config');
const async = require('async');
const _ = require('lodash');

const profanities = require('lib/profanities');

const settingModel = require('models/setting');

var filter = {
  feed: function (post, cb) {
		if(post.field != 'feed') {
			return cb(null, true);
		}
		return cb(null, false);
	},
  post: function (post, cb) {
    settingModel.findOne({}, function (err, settings) {
      if(settings) {
        if(post.value.post_id != settings.post_id) {
    			return cb(null, true);
    		}
      }
      return cb(null, false);
    });
	},
  comment: function (post, cb) {
    if(post.value.item != 'comment') {
      return cb(null, true);
    }
    return cb(null, false);
  },
  organizer: function (post, cb) {
    if(config.get('filters.exclude.organizer')){
      if(post.value.from.id == config.get('facebook.organizer.id')){
        return cb(null, true);
      }
    }
    return cb(null, false);
  },
  profanities: function (post, cb) {
		// create an array with all the data we want to check
		let elements_to_check = _.concat(post.value.from.name.split(' '), post.value.from.name, post.value.message.split(' '));

		// lower case every element
		elements_to_check = _.map(elements_to_check, function (o) { return _.toLower(o); });

		// intersect the profanities array with the elements to check to see if some are in common
		const common = _.intersection(profanities, elements_to_check);

		if(_.size(common) > 0) {
				return cb(null, true);
		}

		return cb(null, false);
  },
  blacklist: function (post, cb) {
		if(config.get('blacklist.users')){
			if(_.indexOf(config.get('blacklist.users'), post.value.from.name) != -1){
				return cb(null, true);
			}
			let elements_to_check = _.concat(post.value.from.name.split(' '), post.value.from.name, post.value.message.split(' '));
			elements_to_check = _.map(elements_to_check, function (o) { return _.toLower(o); });
			const common = _.intersection(config.get('blacklist.words'), elements_to_check);
			if(_.size(common) > 0) {
					return cb(null, true);
			}
			return cb(null, false);
		}
	}
};

module.exports = filter;
