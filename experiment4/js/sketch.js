// sketch.js - purpose and description here
// Author: Your Name
// Date:

let osc, playing = false, freq = 0, amp = 0;
const maxAmp = 0.5, minFreq = 200, maxFreq = 440;
const sampleRate = 10000;

let mousePressedYet = false;
let osc2, osc3;
let numOsc2NotesAbove, numOsc3NotesAbove;

// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas-container");
    // resize canvas is the page is resized
    $(window).resize(function() {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });

    background(100);
    osc = new p5.Oscillator('sine');

    osc2 = new p5.Oscillator('sine');
    osc3 = new p5.Oscillator('sine');
}


// draw() function is called repeatedly, it's the main animation loop
function draw() {
    setBackgroundColor();

    stroke(0);
    noFill();
	amp = osc.getAmp();
    //console.log(freq, amp)
    const sig = genSine(freq, amp, 0);
    const p = genPoints(sig, 0.1, 250);
    drawPoints(p);
    // Draw sine waves for the other two oscillators
    const osc2Freq = mousePressedYet ? osc2.getFreq() : 0;
    const osc2Amp = osc2.getAmp();
    const sig2 = genSine(osc2Freq, osc2Amp, 0);
    const p2 = genPoints(sig2, 0.1, 500);
    drawPoints(p2);
    const osc3Freq = mousePressedYet ? osc3.getFreq() : 0;
    const osc3Amp = osc3.getAmp();
    const sig3 = genSine(osc3Freq, osc3Amp, 0);
    const p3 = genPoints(sig3, 0.1, 750);
    drawPoints(p3);

	textSize(32);
	fill(0);
    textAlign(CENTER);
	text("Lowest Note: " + round(freq, 2) + " Hz", width / 2, 100);
    if (playing) {
        osc.freq(freq, 0.1);
        osc.amp(maxAmp, 0.1);

        // Update the other two oscillators
        osc2.freq(freq * pow(2, (numOsc2NotesAbove / 12)), 0.1);
        osc2.amp(maxAmp, 0.1);
        osc3.freq(freq * pow(2, (numOsc3NotesAbove / 12)), 0.1);
        osc3.amp(maxAmp, 0.1);
    }
}

function mousePressed() {
	const p = mouseY / height;
	freq = lerp(minFreq, maxFreq, p);
    osc.start();
    playing = true;

    osc2.start();
    osc3.start();

    let numOsc2StepsAbove = floor(random(1, 5));
    numOsc2NotesAbove = stepsAboveToNotes(numOsc2StepsAbove);
    osc2.freq(freq * pow(2, (numOsc2NotesAbove / 12)), 0.1);
    osc2.amp(maxAmp, 0.1);
    let numOsc3StepsAbove = numOsc2StepsAbove + floor(random(1, 5));
    numOsc3NotesAbove = stepsAboveToNotes(numOsc3StepsAbove);
    osc3.freq(freq * pow(2, (numOsc3NotesAbove / 12)), 0.1);
    osc3.amp(maxAmp, 0.1);

    mousePressedYet = true;
}

function mouseReleased() {
    // ramp amplitude to 0 over 0.5 seconds
    osc.amp(0, 1);
    playing = false;

    osc2.amp(0, 1);
    osc3.amp(0, 1);
}

// Keep updating the oscillator frequency while the mouse is dragged
function mouseDragged() {
    const p = mouseY / height;
	freq = lerp(minFreq, maxFreq, p);

    osc.freq(freq, 0.1);
    osc.amp(maxAmp, 0.1);

    // Update the other two oscillators
    osc2.freq(freq * pow(2, (numOsc2NotesAbove / 12)), 0.1);
    osc2.amp(maxAmp, 0.1);
    osc3.freq(freq * pow(2, (numOsc3NotesAbove / 12)), 0.1);
    osc3.amp(maxAmp, 0.1);
}


/**
 * Generate points
 * @param {number} f function to generate sine from
 * @param {number} n number of points
 * @param {number} yScale fraction from 0 to 1 of height
 * @param {number} yCoord The y coordinate to draw the points
 * @returns 
 */
function genPoints(f, yScale, yCoord) {
    const h = yScale * height;
	const xp = new Float32Array(sampleRate);
	const yp = new Float32Array(sampleRate);
    const xSpacing = width / sampleRate;
    for (let i = 0; i < sampleRate; i++) {
        const x = xSpacing * i;
        const y = yScale * height * f(x) + yCoord;
		xp[i] = x;
		yp[i] = y;
    }
    return [xp, yp];
}

/**
 * Draw points
 * @param {Array} points 
 */
function drawPoints(points) {
	const x = points[0];
	const y = points[1];
    beginShape();
	for(let i = 0; i < sampleRate; i++) {
        vertex(x[i], y[i]); // Replaced call to curveVertex() with call to vertex()
	}
    endShape();
}

/**
 * Generate sine wave
 * @param {number} freq 
 * @param {number} amp 
 * @param {number} phase 
 * @returns sine wave callback
 */
function genSine(freq, amp, phase) {
    return (x) => amp * sin(0.001 * freq * x + phase);
}

function setBackgroundColor() {
    if (!mousePressedYet) {
        background(255);
        return;
    }
    // Color the background based on the current frequency
    let freqFraction = (freq - minFreq) / (maxFreq - minFreq);
    let ampFraction = (amp - 0) / (maxAmp - 0);
    let redValueIfPlaying = lerp(0, 255, freqFraction);
    let blueValueIfPlaying = lerp(144, 96, freqFraction);
    let redValue = playing ? redValueIfPlaying : lerp(255, redValueIfPlaying, ampFraction);
    let greenValue = playing ? 64 : lerp(255, 64, ampFraction);
    let blueValue = playing ? blueValueIfPlaying : lerp(255, blueValueIfPlaying, ampFraction);
    background(redValue, greenValue, blueValue);
}

// Returns the number of chromatic notes from the root note of a major scale given the number of
// steps above that root note.
function stepsAboveToNotes(numSteps) {
    let numOctaves = floor(numSteps / 7); // 8 notes in the major scale, so 7 steps above for the maximum.
    let remainingSteps = numSteps % 7;
    let additionalNotes = [0, 2, 4, 5, 7, 9, 11][remainingSteps];
    return numOctaves * 12 + additionalNotes;
}