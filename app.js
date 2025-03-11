const express = require("express");
const app = express();
const morgan = require("morgan");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./api/routes/users");
const superRoutes = require("./api/routes/super");

mongoose.connect(
  // "mongodb+srv://forward:" + process.env.MONGO_ATLAS_PW + "@nfc-ard8q.mongodb.net/<dbname>?retryWrites=true&w=majority"
  // "mongodb+srv://forward:" + process.env.MONGO_ATLAS_PW + "@cluster0-zillr.mongodb.net/<dbname>?retryWrites=true&w=majority", {
  "mongodb+srv://admin:admin@cluster0.u169g.mongodb.net/kenme?retryWrites=true&w=majority", 
  // THIS WAS THEIR DB
  // "mongodb+srv://admin:admin@cafe.qrove.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  // "mongodb+srv://umeredava:B2KfNgHCyCxlCnVt@cluster0.o5ksmkg.mongodb.net/kenme",
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
