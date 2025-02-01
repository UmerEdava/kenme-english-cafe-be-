const mongoose = require("mongoose");
const moment = require("moment");
const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
  },
  age: {
    type: String,
  },
  level: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
  },
  place: {
    type: String,
  },
  marks: {
    type: String,
  },
  fcmToken: {
    type: String,
  },
  isAdmited: {
    type: Boolean,
    default: false,
  },
  answers: {
    type: String,
  },
  days: {
    type: String,
    default: "0",
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officials",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  admited_at: {
    type: Date,
    default: adjustForTimezone(),
  },
  batch_date: {
    type: String,
  },
  admited_by: {
    type: String,
  },
  device_id: {
    type: String,
  },
  review: [
    {
      name: String,
      review: String,
      reviewer_id: mongoose.Schema.Types.ObjectId,
    },
  ],
  amount: {
    type: Number,
  },
  receipt: [
    {
      amount: Number,
      url: String,
      transaction_id: String,
      payed_by: mongoose.Schema.Types.ObjectId,
    },
  ],
  has_referral: {
    type: Boolean,
    default: false,
  },
});

function adjustForTimezone() {
  return moment().add(5, "hours").add(30, "minutes");
}
module.exports = mongoose.model("User", userSchema);
