const https = require("https");
const fs = require("fs");
const app = require("./app");
var http = require("http");

const opts = {
  key: fs.readFileSync("private.key"),
  cert: fs.readFileSync("certificate.crt"),
  ca: fs.readFileSync("ca_bundle.crt"),
};

http.createServer(app).listen(4001, () => {console.log('server connected successfully')});
