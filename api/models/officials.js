const mongoose = require("mongoose");

const officials = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  contact_no: {
    type: String,
    required: true,
    unique: true,
  },
  fcm_token: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  basic_salary: {
    type: Number,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "counsellor", "tutor", "receptionist"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// 1 -> amdin
// 2 -> counsellor
// 3 -> receptionist
// 4 -> tutor

// officials.pre("save", function (next) {
//   var user = this;

//   // only hash the password if it has been modified (or is new)
//   if (!user.isModified("password")) return next();

//   // generate a salt
//   bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
//     if (err) return next(err);

//     // hash the password using our new salt
//     bcrypt.hash(user.password, salt, function (err, hash) {
//       if (err) return next(err);
//       // override the cleartext password with the hashed one
//       user.password = hash;
//       next();
//     });
//   });
// });

// officials.methods.comparePassword = function (candidatePassword, cb) {
//   console.log(candidatePassword, "sssss", this.password);
//   bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
//     if (err) return cb(err);
//     cb(null, isMatch);
//   });
// };

module.exports = mongoose.model("Officials", officials);
