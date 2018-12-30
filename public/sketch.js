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
 *   Each index of currAnt is a single pen stroke.
 *   a stroke is a single line from pen down to pen up
 *
 *   NOTE: 'stroke' is called 'path'
 *   because stroke() is a p5 function
 *
 *   Each path currAnt[pi] has two indexes:
 *   [0] the x values for each vertex of the line
 *   [1] the y values for each vertex of the line
 *
 *   Thus, a single vertex of a specific path is:
 *
 *   { x: ant.drawing[pi][0][i],
 *
 *     y: ant.drawing[pi][1][i] }
 */
let currAnt;

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
 * Previous X coordinate, to start the next line draw from
 */
let prevX;
/**
 * Previous Y coordinate, to start the next line draw from
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
  if (currAnt) {
    const x = currAnt[pi][0][li] + 127;
    const y = currAnt[pi][1][li] + 127;

    if (prevX) {
      line(prevX, prevY, x, y);
    }

    li++;

    prevX = x;
    prevY = y;

    checkBounds();
  }
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

function checkBounds() {
  if (li >= currAnt[pi][0].length) {
    resetLine();

    if (pi >= currAnt.length) {
      reset();
    }
  }
}

function resetLine() {
  pi++;
  li = 0;
  prevX = null;
  prevY = null;
}

function reset() {
  pi = 0;
  currAnt = null;
}

function sendDoodleData(data) {
  socket.emit("send image data", data);
}

function requestDoodle() {
  loadJSON("/getTraining", gotDoodle);
}

function gotDoodle(ant) {
  currAnt = ant;
}
