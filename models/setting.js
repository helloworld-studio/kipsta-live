const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  access_token: { type: String },
  post_id: { type: String }
});

const setting = mongoose.model('Settings', settingsSchema);

module.exports = setting;
