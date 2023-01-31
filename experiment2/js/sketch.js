// sketch.js - purpose and description here
// Author: Your Name
// Date:

const WIDTH = 1280;
const HEIGHT = 800;

const STROKE_WEIGHT = 3;
const NUM_TRACKING_RECTS = 1280;
const MAX_TRACKING_RECT_LENGTH = 12;
const TRACKING_RECT_WIDTH = 2;

let trackingRects = [];

class TrackingRect {
  constructor(x, y, length, angleOffset) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.angleOffset = angleOffset + HALF_PI; // Add HALF_PI here to account for original rectangle orientation

    this.currAngle = atan2(mouseY - this.y, mouseX - this.x) + this.angleOffset;
    this.color = "black";
  }

  display() {
    stroke(this.color);
    fill(this.color);

    this.currAngle = atan2(mouseY - this.y, mouseX - this.x) + this.angleOffset;
    translate(this.x, this.y);
    rotate(this.currAngle);
    rect(0, 0, TRACKING_RECT_WIDTH, this.length);
  }
}

// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
    // resize canvas is the page is resized
    $(window).resize(function() {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });

    canvas = createCanvas(WIDTH, HEIGHT);
    background(255);
    strokeWeight(STROKE_WEIGHT);
    rectMode(CENTER);

    for (let i = 0; i < NUM_TRACKING_RECTS; i++) {
        trackingRects.push(new TrackingRect(
        round(random(WIDTH)),
        round(random(HEIGHT)),
        1 + round(random(MAX_TRACKING_RECT_LENGTH)),
        random(PI/4)
        ));
    }
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
}

function mouseMoved() {
    clear();
    for (let trackingRect of trackingRects) {
      push();
      trackingRect.display();
      pop();
    }
  }