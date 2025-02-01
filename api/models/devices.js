const mongoose = require("mongoose");

const device = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
  device: {
    type: String,
  },
  device_id: {
    type: String,
  },
  version: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Devices", device);
