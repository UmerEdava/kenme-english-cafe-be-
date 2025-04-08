const express = require("express");
const router = express.Router();

const SuperController = require("../controller/super");

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
    console.log("Body- " + JSON.stringify(req.body));
    console.log("Body- " + JSON.stringify(file));

    // console.log(req.body.file);
    // console.log(req);
    cb(
      null,
      req.body.fileName
        ? `${req.body.fileName}.${file.originalname.split(".")[1]}`
        : Date.now() + "_" + file.originalname
    );
  },
};
var upload = multer({
  storage: multerS3(storage),
});

router.post("/login", SuperController.login);
router.get("/dashboard", SuperController.dashboard);
router.get("/feedbacks", SuperController.feedbacks);
router.post("/feedbacks", SuperController.add_feedback);
router.get("/banners", SuperController.get_banner);
router.get("/home_contents", SuperController.home_contents);
router.post("/delete_banner/:id", SuperController.delete_banner);
router.post(
  "/add_banner",
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  SuperController.add_banner
);  

router.get("/numbers", SuperController.get_number);
router.post("/create_number", SuperController.create_number);
router.get("/delete_phone/:id", SuperController.delete_phone);
router.get("/banner/:id", SuperController.delete_phone);
router.post("/Feedback/clearall", SuperController.clear_feedbacks);

router.post("/send_notification", SuperController.sendNotification);

router.post("/getOfficials", checkAuth, SuperController.getOfficials);
router.post("/createOfficials", SuperController.createOfficials);
router.post("/updateOfficials", SuperController.updateOfficials);
router.post("/deleteOfficials/:id", SuperController.deleteOfficials);
router.post("/loginOfficials", SuperController.loginOfficials);

router.post(
  "/upload_reciept",
  upload.single("file"),
  SuperController.uploadReceipt
);

router.post("/createStudent", SuperController.createStudent);
router.post("/createBatch", SuperController.createBatch);
router.post("/deleteBatch", SuperController.deleteBatch);

router.post("/getAdmittedCount/:id", checkAuth, SuperController.getAdmittedCount);

router.post("/getLinkedStudents", SuperController.getLinkedStudents);
router.get("/getAdminFilters", SuperController.getAdminFilters);

router.post("/createBatches", SuperController.createBatches);
router.get("/getBatches",checkAuth, SuperController.getBatches);
router.post("/closeBatch", SuperController.closeBatch);

router.post("/bulkOps", SuperController.bulkOps);

module.exports = router;
