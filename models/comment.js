const mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
	field: { type: String },
	value: {
		from: {
			id: { type: String },
			name: { type: String },
			profile_pic: { type: String, default: null }
		},
		item: { type: String },
		comment_id: { type: String },
		post_id: { type: String },
		verb: { type: String, emum: ['add', 'block', 'edit', 'edited', 'delete', 'follow', 'hide', 'mute', 'remove', 'unblock', 'unhide', 'update'] },
		parent_id: { type: String },
		created_at: { type: Date },
		post: {
			type: { type: String },
			updated_time: { type: Date },
			promotion_status: { type: String },
			permalink_url: { type: String },
			id: { type: String },
			status_type: { type: String },
			is_published: { type: Boolean }
		},
		message: { type: String }
	},
	moderate: { type: Boolean, default: false },
	selected: { type: Boolean, default: false },
	winner: { type: Boolean, default: false }
});

commentSchema.index({'value.message': 'text', 'value.code': 'text', 'value.from.name': 'text'});

var comment = mongoose.model('Comment', commentSchema);

module.exports = comment;
