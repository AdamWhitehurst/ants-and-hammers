/// <reference path="./p5/p5.global-mode.d.ts" />

// DOM Elements
let inputTextElement;
let inputButtonElement;
let canvasElement;

// p5 elements
let canvas;
let currAnt;

let ctx;

// DRAWING INDEXES
let pi = 0; // Path index
let li = 0; // Line (in a path) index
let prevX;
let prevY;

// called by p5
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

function init() {
  clear();
  background(24);
  noFill();
  stroke(255);
  strokeWeight(2);
  translate(width / 2, height / 2);

  requestDoodle();
}

// called by p5
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
  /*
   *   ANT.DRAWING[] FORMAT:
   *   Each index in ant.drawing[] is a single stroke
   *   a stroke is a single line from pen down to pen up
   *   NOTE: 'stroke' is called 'path'
   *   because stroke() is a p5 function
   *
   *   Each path in ant.drawing[][] has two indexes:
   *   [0] the x values for each vertex of the line
   *   [1] the y values for each vertex of the line
   *
   *   Thus, a single vertex of a specific path is:
   *   {
   *     x: ant.drawing[path][0][i],
   *     y: ant.drawing[path][1][i]
   *   }
   *
   */
}
