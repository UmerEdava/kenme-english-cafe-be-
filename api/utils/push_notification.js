var admin = require("firebase-admin");
const moment = require("moment");
const Officials = require("../models/officials");

exports.sendPushNotification = (tokens, title, body, payload) => {
  const content = {
    notification: {
      title: title,
      body: body,
    },
    data: payload ?? {},
  };
  admin
    .messaging()
    .sendToDevice(tokens, content)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};
exports.triggetNotification = async (req, type) => {
  try {
    const fcmTokens = (
      await Officials.find({ role: "admin" }).select("fcm_token")
    ).map((e) => e.fcm_token);
    if (!fcmTokens) return;
    switch (type) {
      case NOTI_TYPE.BR_CREATE:
        this.sendPushNotification(
          fcmTokens,
          "New Batch created",
          `${req.headers.name} created new batch on ${req.body.batch_date}`
        );
        break;
      case NOTI_TYPE.BR_DELETE:
        this.sendPushNotification(
          fcmTokens,
          "Batch Deleted",
          `${req.headers.name} Deleted ${req.body.students.length} students from the batch`
        );
        break;
      case NOTI_TYPE.ST_REVIEWD:
        this.sendPushNotification(
          fcmTokens,
          "Reviewed",
          `${req?.sender} has reviwed the student ${req?.name} as "${req?.review}"`
        );
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
  }
};

const NOTI_TYPE = {
  BR_DELETE: "branch_delete",
  BR_CREATE: "branch_create",
  ST_REVIEWD: "student_reviewd",
};

exports.NOTI_TYPE = NOTI_TYPE;
