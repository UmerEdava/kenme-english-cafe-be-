// const jwt = require('jsonwebtoken');
const Devices = require("../models/devices");

const admin = require("firebase-admin");
// const serviceAccount = require("./english-cafe-f21a6-firebase-adminsdk-jaw1b-135f67c67a.json");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n"),

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = async (req, res, next) => {
  try {
    next();
    // const token = req.header("Authorization").replace("Bearer", "").trim();
    // if (!token) {
    //   return res.status(401).json({
    //     status: false,
    //     message: "Auth failed-",
    //   });
    // }

    // admin
    //   .auth()
    //   .verifyIdToken(token)
    //   .then(function (decodedToken) {
    //     if (decodedToken) {
    //       next();
    //     } else {
    //       return res.status(401).json({
    //         status: false,
    //         message: "Auth failed",
    //       });
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //     return res.status(401).json({
    //       status: false,
    //       message: "Auth failed",
    //     });
    //   });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: "Auth failed",
    });
  }
};
