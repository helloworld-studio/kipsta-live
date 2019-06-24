const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  access_token: { type: String },
  post_id: { type: String },
  phase: {
    one: { type: Number },
    two: { type: Number },
    three: { type: Number },
    four: { type: Number },
    five: { type: Number },
    six: { type: Number },
    seven: { type: Number },
    eight: { type: Number },
    nine: { type: Number },
    ten: { type: Number }
  }
});

const setting = mongoose.model('Settings', settingsSchema);

module.exports = setting;
