const express = require("express");
const router = express.Router();

const UserController = require("../controller/user");

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const checkAuth = require('../middleware/check_auth');

aws.config.update({
  // secretAccessKey: "gTIyACqmi5pGRI7yrmUe/zU/WIwZVAItNUZxGMHq",
  // accessKeyId: "AKIA6O7GWWX3OV244SC6",
  // region: "ap-south-1",

  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

var s3 = new aws.S3();

var storage = {
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  ACL: "public-read",
  key: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname); //use Date.now() for unique file keys
  },
};
var upload = multer({
  storage: multerS3(storage),
});

router.post("/signup", UserController.user_signup);
router.post("/getAllStudent", checkAuth, UserController.getAllStudent);
router.post("/getActivatedStudents", UserController.getActivatedStudents);
router.post("/details", checkAuth, UserController.user_login);
router.post("/check_user", UserController.check_user);
router.get("/delete/:phone", UserController.delete);
router.post("/delete/:phone", UserController.deacticate);
router.get("/detail/:phone", UserController.detail);
router.post("/add_score", checkAuth, UserController.addMark);
router.get("/questions", checkAuth, UserController.questions);
router.post("/notifications", checkAuth, UserController.notifications);
router.post("/get_classes", checkAuth, UserController.get_classes);
router.post("/super_signup", UserController.super_signup);
router.delete("/delete_class/:id", UserController.delete_class);

router.post(
  "/add_classess",
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
  ]),

  UserController.add_classess
);
router.post(
  "/update/:phone",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  UserController.update
);

router.get("/get_certificate", UserController.get_certificate);
  
module.exports = router;
