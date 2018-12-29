const fs = require("fs");
const ndjson = require("ndjson");

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

// Set up Express
const express = require("express");
const e = express();
const portNum = 1338;

e.listen(portNum, () => console.log("Listening on ++1337 port!"));
e.get("/getAnt", getAnt);
e.get("/getHam", getHam);

e.use("/", express.static("public"));
