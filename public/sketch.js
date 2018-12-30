/// <reference path="./p5/p5.global-mode.d.ts" />

/**
 * @type HTMLElement
 */
let inputTextElement;

/**
 * @type HTMLElement
 */
let inputButtonElement;

/**
 * @type HTMLElement
 */
let canvasElement;

/**
 * @type HTMLCanvasElement
 */
let canvas;

/**
 *   Each index of currDoodle is a single pen stroke.
 *   a stroke is a single line from pen down to pen up
 *
 *   NOTE: 'stroke' is called 'path'
 *   because stroke() is a p5 function
 *
 *   Each path currDoodle[pi] has two indexes:
 *   [0] the x values for each vertex of the line
 *   [1] the y values for each vertex of the line
 *
 *   Thus, a single vertex of a specific path is:
 *
 *   { x: currDoodle[pi][0][i],
 *
 *     y: currDoodle[pi][1][i] }
 */
let currDoodle;

/**
 * @type RenderingContext
 */
let ctx;

/**
 * Index of the current stroke path to draw
 */
let pi = 0;
/**
 * Index of the current line within a path to draw
 */
let li = 0;

/**
 * Previous X coordinate of doodle line
 * position to start the next line draw
 */
let prevX;
/**
 * Previous Y coordinate of doodle line
 * position to start the next line draw
 */
let prevY;

function setup() {
  canvas = createCanvas(510, 510);
  canvas.parent("sketch-holder");

  inputTextElement = document.getElementById("textInput");

  inputButtonElement = document.getElementById("button");
  inputButtonElement.addEventListener("click", submitForm);

  formElement = document.getElementById("form");
  formElement.addEventListener("submit", submitForm);

  canvasElement = document.getElementById("defaultCanvas0");
  ctx = canvasElement.getContext("2d");

  init();
}

function draw() {
  if (!currDoodle) return;

  const x = currDoodle[pi][0][li] + 127;
  const y = currDoodle[pi][1][li] + 127;

  if (prevX) {
    line(prevX, prevY, x, y);
  }

  li++;

  prevX = x;
  prevY = y;

  checkBounds();
}

/**
 * Initializes the canvas element to blank
 * then requests a new doodle from server
 */
function init() {
  clear();
  background(24);
  noFill();
  stroke(255);
  strokeWeight(2);
  translate(width / 2, height / 2);

  requestDoodle();
}

function submitForm(data) {
  data.preventDefault();
  sendDoodleData(ctx.getImageData(0, 0, 510, 510).data);
  init();
}

/**
 * Checks whether the next line and path
 * index are outside the bounds of the doodle
 */
function checkBounds() {
  if (li >= currDoodle[pi][0].length) {
    resetLine();
    pi++;
    if (pi >= currDoodle.length) {
      reset();
    }
  }
}

/**
 * Resets the line index and previous coordinates
 */
function resetLine() {
  li = 0;
  prevX = null;
  prevY = null;
}

/**
 * Resets the path index and clears the current doodle
 */
function reset() {
  pi = 0;
  currDoodle = null;
}

/**
 * Sends passed image data to server
 * @param {ImageData} data
 */
function sendDoodleData(data) {
  socket.emit("send image data", data);
}

/**
 * Requests a new doodle from server
 */
function requestDoodle() {
  loadJSON("/getTraining", gotDoodle);
}

/**
 * Called when recieved doodle data from server,
 * sets currDoodle to new doodle data
 * @param {number[]} doodle
 */
function gotDoodle(doodle) {
  currDoodle = doodle;
}
