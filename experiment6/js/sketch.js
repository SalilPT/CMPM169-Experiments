// Title: "Floating Randomly Generated Quotes"
// Description: "A small program that makes randomly generated quotes when the user clicks that float around the canvas."
// Date: February 21, 2023
// Code adapted from the following:
// - https://editor.p5js.org/wmodes/sketches/Afy06Yhym
// - https://openprocessing.org/sketch/1359419

// Constants - User-servicable parts
const quoteJSON = {
    "origin": ["#evenNumber# #timeMeasure# and #oddNumber# years ago our #parents# brought forth, upon this #placeAdjective# #place#, a new #newThing#, conceived in #idea#, and dedicated to the proposition that #proposition#."],
    "timeMeasure": ["score", "weeks", "months"],
    "evenNumber": ["Two", "Four", "Six", "Eight", "Ten"],
    "oddNumber": ["three", "five", "seven", "nine", "eleven", "thirteen"],
    "parents": ["fathers", "moms", "grandfathers", "grandmas", "Uncle Chuck and Aunt Josephine", "ancestors", "alien progenitors"],
    "placeAdjective": ["beautiful", "great", "astounding", "dark", "wretched"],
    "place": ["continent", "planet", "neighborhood", "shopping mall"],
    "newThing": ["nation", "car", "idea", "cuisine", "restaurant", "dish"],
    "idea": ["liberty", "a closet", "a disco", "a drunken stupor", "freedom", "a big black cast iron pot"],
    "proposition": ["all men are created equal", "I'll pay you back on Tuesday", "there are bigger fish to fry", "you got to get back on the horse", "I'm gonna get the secret of man's red flower, mancub", "you get what you pay for"]
};

const whoSaidIt = [
    "Albert Einstein",
    "Winston Churchill",
    "Martin Luther King Jr.",
    "Confucius",
    "Lao Tzu",
    "Oscar Wilde",
    "Abraham Lincoln",
    "Mark Twain",
    "Mother Teresa",
    "John F. Kennedy",
    "Thomas Jefferson",
    "Kurt Vonnegut",
]

// Globals
let quoteGrammar;

let particles = [];

// Particle class code adapted from https://openprocessing.org/sketch/1359419
class Particle {
    constructor(x, y, text, colorScheme) {
        this.x = x;
        this.y = y;
        this.vx = random(-1, 1);
        this.vy = random(-1, 1);
        this.rotationAngle = random(-8, 8);
        //This sets the text size to be consistent
        this.size = random(15, 50);
        //This sets the current line to the particle
        this.text = text;

        // Set the color of the text associated with this object to a random shade of green
        switch (colorScheme) {
            case "red":
                this.color = color(224, floor(random(129)), floor(random(129)));
                break;
            case "yellow":
                this.color = color(224, 224, floor(random(64, 129)));
                break;
            case "green":
                this.color = color(floor(random(129)), 255, floor(random(129)));
                break;
            default:
                this.color = color(floor(random(129)), 255, floor(random(129))); // Green
                break;
        }

        // Variables used for typewriter effect
        this.currTextCharIndex = 0;
        this.currTextPortion = this.text;
        this.framesUntilNextChar = 0;
    }

    finished() {
        //Change this to 255 if you reverse the fade
        return (this.width < 0 || this.width > windowWidth);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    #updateTypewriterEffect() {
        if (this.currTextCharIndex >= this.text.length) {
            return;
        }

        if (this.framesUntilNextChar > 0) {
            this.framesUntilNextChar -= 1;
            return;
        }

        let currChar = this.text[this.currTextCharIndex];
        if (this.framesUntilNextChar == 0) {
            this.currTextCharIndex += 1;
            this.currTextPortion = this.text.slice(0, this.currTextCharIndex);
            if (this.currTextCharIndex == this.text.length) {
                this.framesUntilNextChar = -1;
                return;
            }

            if (currChar == "," || currChar == ".") {
                this.framesUntilNextChar = 20; // Longer delay for pauses
                return;
            }
            this.framesUntilNextChar = 3;
        }
    }

    show() {
        noStroke();
        textSize(this.size);
        textFont("Courier");
        //This centers the text on the click
        textAlign(CENTER, CENTER);

        fill(this.color);

        // Get the portion of the text that should currently be shown
        this.#updateTypewriterEffect();

        // Rotate the text
        push();
        translate(this.x, this.y);
        rotate(this.rotationAngle);

        //This positions the text
        text(this.currTextPortion, 0, 0);
        pop();
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
    background(50);

    angleMode(DEGREES);
    frameRate(60);
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
    // Particle update code adapted from https://openprocessing.org/sketch/1359419
    //This moves the particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].show();
        if (particles[i].finished()) {
            // remove this particle
            particles.splice(i, 1);
        }
    }
    background(50, 50, 50, 84);
}

//This draws the word with each mouse click
function mouseClicked() {
    quoteGrammar = tracery.createGrammar(quoteJSON);
    var output = quoteGrammar.flatten("#origin#"); //creates sentence from grammar source
    let randomColorScheme = random(["red", "yellow", "green"])
    let p = new Particle(mouseX, mouseY, output, randomColorScheme);
    particles.push(p);

    // Spawn two quotation marks in random locations
    let quotationMark1 = new Particle(random(width), random(height), "\"", randomColorScheme);
    let quotationMark2 = new Particle(random(width), random(height), "\"", randomColorScheme);
    particles.push(quotationMark1);
    particles.push(quotationMark2);
}