const express = require("express");
const app = express();
const morgan = require("morgan");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const userRoutes = require("./api/routes/users");
const superRoutes = require("./api/routes/super");
const job = require("./cron/cron");

mongoose.connect(
  // "mongodb+srv://forward:" + process.env.MONGO_ATLAS_PW + "@nfc-ard8q.mongodb.net/<dbname>?retryWrites=true&w=majority"
  // "mongodb+srv://forward:" + process.env.MONGO_ATLAS_PW + "@cluster0-zillr.mongodb.net/<dbname>?retryWrites=true&w=majority", {
  process.env.MONGO_URI, 
  // THIS WAS THEIR DB
  // "mongodb+srv://admin:admin@cafe.qrove.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Db connection Established");
});

app.use(cors());
app.options("*", cors());
app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

job.start();

// Routes should handle request
app.use("/user", userRoutes);
app.use("/super", superRoutes);
app.use(express.static("vcard"));

app.use((req, res, next) => {
  const error = new Error("Note Found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  console.log(error);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
