const mongoose = require("mongoose");

const feedback = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
  },
  contact_no: {
    type: String,
  },
  subject: {
    type: String,
  },
  feedback: {
    type: String,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedback);
