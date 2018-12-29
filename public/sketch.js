/// <reference path="./p5/p5.global-mode.d.ts" />

let currAnt;
/*  ANT.DRAWING[] FORMAT:
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
 */

// DRAWING INDEXES
let pi = 0; // Path index
let li = 0; // Line (in a path) index
let prevX;
let prevY;

function setup() {
  createCanvas(510, 510);
  background(24);
  noFill();
  stroke(255);
  strokeWeight(2);
  translate(width / 2, height / 2);

  retrieveAnt();
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

function checkBounds() {
  if (li >= currAnt[pi][0].length) {
    pi++;
    li = 0;
    prevX = null;
    prevY = null;

    if (pi === currAnt.length) {
      pi = 0;
      clear();
      currAnt = null;
      setup();
    }
  }
}
function gotAnt(ant) {
  currAnt = ant.drawing;
}

function retrieveAnt() {
  loadJSON("/getAnt", gotAnt);
}
