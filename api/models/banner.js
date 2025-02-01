const mongoose = require("mongoose");

const banner = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  file: {
    type: String,
  },
  tittle: {
    type: String,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Banner", banner);
