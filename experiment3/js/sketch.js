// Title: "Game of Ant"
// Description: ""
// Date: January 31, 2023
// Code adapted from the following:
// - https://editor.p5js.org/wmodes/sketches/ixuIQcgLi

const width = 100;
const height = 100;
const cellSize = 10;
let grid;
let nextGrid;

const ANT_START_POS = {
  x: Math.floor(width / 2),
  y: Math.floor(height / 2)
};
const ANT_START_DIRECTION = { // Vector for a cardinal direction
  x: 0,
  y: -1
};

let ant;

class LangtonsAnt {
  constructor(startPos, initialDirection) {
    this.pos = startPos;
    this.direction = initialDirection;
  }

  // Outline ant position
  drawSelf() {
    noFill();
    stroke(216, 64, 32);
    strokeWeight(4);
    rect(ant.pos.x * cellSize, ant.pos.y * cellSize, cellSize, cellSize);
    stroke(0);
    strokeWeight(1);
  }

  moveForward() {
    grid[this.pos.x][this.pos.y] = Number(!grid[this.pos.x][this.pos.y]) * 2; // Sets cell value to either 0 or 2
    this.pos.x = (this.pos.x + this.direction.x) % width;
    this.pos.x = this.pos.x < 0 ? width - 1 : this.pos.x;
    this.pos.y = (this.pos.y + this.direction.y) % height;
    this.pos.y = this.pos.y < 0 ? height - 1 : this.pos.y;
  }

  turnLeft() {
    this.direction = { // Multiply direction vector by rotation matrix
      x: this.direction.y,
      y: -this.direction.x
    };
  }

  turnRight() {
    this.direction = { // Multiply direction vector by rotation matrix
      x: -this.direction.y,
      y: this.direction.x
    };
  }
}

// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(width * cellSize, height * cellSize);
    canvas.parent("canvas-container");
    // resize canvas is the page is resized
    $(window).resize(function() {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });

    background(0);
    grid = create2DArray(width, height);
    nextGrid = create2DArray(width, height);
    // randomly populate grid
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        grid[x][y] = floor(random(2));
      }
    }

    ant = new LangtonsAnt(ANT_START_POS, ANT_START_DIRECTION);
  }

  function draw() {
    // draw current state of grid
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (grid[x][y] === 1) { // Live cell
          fill(255);
        }
        else if (grid[x][y] === 2) { // Persistent live cell (created by ant)
          fill(0, 255, 0);
        }
        else {
          fill(floor(48 * noise(x, y, frameCount / 15))); // Dead Cell
        }
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    ant.drawSelf();

    doAntUpdate();
    doGameOfLifeUpdate();

    // update grid
    grid = nextGrid;
    nextGrid = create2DArray(width, height);
  }

  function countNeighbors(x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        let col = (x + i + width) % width;
        let row = (y + j + height) % height;
        sum += grid[col][row] ? 1 : 0;
      }
    }
    sum -= grid[x][y];
    return sum;
  }

  function create2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(rows);
    }
    return arr;
  }

  function doAntUpdate() {
    grid[ant.pos.x][ant.pos.y] >= 1 ? ant.turnRight() : ant.turnLeft();
    ant.moveForward();
  }

  function doGameOfLifeUpdate() {
    // update next grid
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Don't count neighbors if it's a persistent cell
        if (grid[x][y] === 2) {
          nextGrid[x][y] = grid[x][y];
          continue;
        }

        let neighbors = countNeighbors(x, y);
        if (grid[x][y] === 1 && (neighbors < 2 || neighbors > 3)) {
          nextGrid[x][y] = 0;
        } else if (grid[x][y] === 0 && neighbors === 3) {
          nextGrid[x][y] = 1;
        } else {
          nextGrid[x][y] = grid[x][y];
        }
      }
    }
  }