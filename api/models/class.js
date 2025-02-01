const mongoose = require("mongoose");

const classSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  class_type: {
    type: String,
    required: true,
  },
  content_type: {
    type: String,
    required: true,
  },
  file: {
    type: String,
  },
  tittle: {
    type: String,
  },
  level: {
    type: String,
  },
  description: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Class", classSchema);
