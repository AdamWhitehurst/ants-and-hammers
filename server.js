const fs = require("fs");
const ndjson = require("ndjson");
const express = require("express");
const app = express();
const http = require("http").Server(app);
var io = require("socket.io")(http);
const portNum = 1338;

// Set up Express

http.listen(portNum, () => console.log("Listening on ++1337 port!"));
app.get("/getAnt", getAnt);
app.get("/getHam", getHam);
app.get("/sendImageData", gotData);
app.use("/", express.static("public"));

// Set up Socket.io
io.on("connection", socket => {
  socket.on("send image data", gotData);
});

// Create filestream interfaces
const anterFace = [];
fs.createReadStream("./drawings/ant.ndjson")
  .pipe(ndjson.parse())
  .on("data", ant => {
    anterFace.push(ant);
  });

const hamterFace = [];
fs.createReadStream("./drawings/hammer.ndjson")
  .pipe(ndjson.parse())
  .on("data", ham => {
    hamterFace.push(ham);
  });

// Callable functions
function getAnt(req, resp) {
  // Returns random ant from our anterFace
  resp.send(anterFace[Math.floor(Math.random() * anterFace.length)]);
}

function getHam(req, resp) {
  // Returns random hammer from our hamterFace
  resp.send(hamterFace[Math.floor(Math.random() * hamterFace.length)]);
}

function gotData(data) {
  console.log(data);
}
