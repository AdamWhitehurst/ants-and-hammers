const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const fs = require("fs");
const ndjson = require("ndjson");
const DoodleIdentifier = require("./doodle-identifier.js");

const did = new DoodleIdentifier();
/**
 * Websocket port to use
 */
const portNum = 1338;
/**
 * The portion of data to be used as taining data
 */
const trainingFraction = 0.8;
/**
 * Total amount of time for getData() to wait for
 * doodleArray to initialize
 */
const maxWaitMS = 1000;
/**
 * @type [Array, Array]
 * Array of Doodle arrays
 * Arrays are stored in an array so they can be
 * addressed by 'doodleType' value in getDoodle()
 * doodleArray[0] = ant doodles
 * doodleArray[1] = hammer doodles
 * @see initDoodleData()
 */
const doodleArray = [[], []];

/**
 * @type [number, number]
 * Stored in an array so they can be addressed by
 * 'doodleType' value in getDoodle()
 * @see initDoodleData()
 */
const trainingBounds = [];

/**
 * Set to true when doodleArray and trainingBounds
 * have been properly initialized
 */
initDoodleData();
initHTTPServer();

/**
 * Asynchronously initializes HTTP Server:
 * Express used for static file serving and routing
 * Socket.io used for passing data from client to server
 */
async function initHTTPServer() {
  // Set up Express
  http.listen(portNum, () => console.log("Listening on ++1337 port!"));
  app.get("/getTraining", (req, resp) => getData(req, resp));
  app.get("/getTesting", (req, resp) => getData(req, resp, true));

  app.get("/sendImageData", gotDoodleData);
  app.use("/", express.static("public"));

  // Set up Socket.io
  io.on("connection", socket => {
    socket.on("send image data", dData => {
      gotDoodleData(dData, socket);
    });
  });
}

/**
 * Asynchronously initialize Doodle Data
 * NDJSON parses doodle json data from
 * fs filestream pipe and pushes it to the
 * specified doodleArray array
 */
async function initDoodleData() {
  fs.createReadStream("./drawings/ant.ndjson")
    .pipe(ndjson.parse())
    .on("data", ant => {
      doodleArray[0].push(ant.drawing);
    })
    .on("end", () => {
      trainingBounds.push(Math.floor(doodleArray[1].length * trainingFraction));
    });

  fs.createReadStream("./drawings/hammer.ndjson")
    .pipe(ndjson.parse())
    .on("data", ham => {
      doodleArray[1].push(ham.drawing);
    })
    .on("end", () => {
      trainingBounds.push(Math.floor(doodleArray[1].length * trainingFraction));
    });
}

/**
 * Loosely waits for doodlesArray and trainingBounds
 * to be intialized. Returns when trainingBounds length
 * is >= 2 because trainingBounds recieves values only
 * when the corresponding doodleArray has been filled.
 * TODO: HOW TO BETTER KNOW IF DOODLEARRAY INITTED?
 * @param {number} timeout
 * Total amount of MS to wait before rejecting
 */
function doodlesInitialized(timeout) {
  // Referencing
  // https://hackernoon.com/lets-make-a-javascript-wait-function-fa3a2eb88f11
  return new Promise((r, j) => {
    const check = () => {
      if (trainingBounds.length >= 2) {
        r(true);
      } else if ((timeout -= 100 < 0)) {
        j("Waiting for doodles to initialize, Timed out.");
      } else {
        setTimeout(check, 100);
      }
    };

    setTimeout(check, 100);
  });
}
/**
 * Recieves http request for doodle data.
 * Randomly selects data from either ants or hammer doodles
 * @param {any} req Http request data (unused)
 * @param {any} resp Http response data, used to call send()
 * @param {boolean} testing If defined, doodle will be from
 * testing partition of specified doodleType
 */
async function getData(req, resp, testing) {
  /*
   * 'doodleType' determines with type of doodle
   * (ant or hammer) to return.
   * Will be either 0 or 1: 0 = ant, 1 = hammer
   */
  await doodlesInitialized(maxWaitMS);
  let doodleType = randomInteger(0, 2);
  let d = getDoodle(doodleType, testing);
  resp.send(d);
}

/**
 *
 * @param {number} doodleType
 * Which type of doodle to return
 * (0 = ant, 1 = hammer)
 * @param {boolean} testing
 * Whether or not to pull from the testing
 * partition of the specified doodleType
 * @returns A random doodle of the type specified
 * by doodleType from the partition of data based
 * on the testing boolean
 */
function getDoodle(doodleType, testing) {
  /**
   * If 'testing' is defined, we want the random index
   * to be from the testing partition of the specified
   * doodle type. The testing partition is the data on
   * the end the specified doodle type array, which is
   * beyond the trainingBound value.
   */
  const randIndex = testing
    ? randomInteger(trainingBounds[doodleType], doodleArray[doodleType].length)
    : randomInteger(0, trainingBounds[doodleType]);

  return { dType: doodleType, doodle: doodleArray[doodleType][randIndex] };
}

/**
 * Called when the server recieves Doodle Image Data
 * from a socket
 * @param {{imageData: ImageData, dType: number}} dData
 * @param {any} socket
 */
function gotDoodleData(dData, socket) {
  did.recieveImageData(dData);
}

/**
 * Do I really need to explain what this function might do?
 * @param {number} min Lower bound of random integer (inclusive)
 * @param {number} max Upper bound of random integer (exclusive)
 * @returns a random number between
 * 'min' (inclusive) and 'max' (exclusive)
 */
function randomInteger(min, max) {
  return Math.floor(Math.random() * max - min) + min;
}
