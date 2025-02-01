const mongoose = require("mongoose");

const banner = mongoose.Schema({
  //   _id: mongoose.Schema.Types.ObjectId,
  date: {
    type: String,
    unique: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Batches", banner);
