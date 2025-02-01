const mongoose = require("mongoose");

const phone = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  number: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: "No Name",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("phone", phone);
