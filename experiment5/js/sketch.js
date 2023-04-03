// Title: "Lively WebGL Explosion Maker"
// Description: "A small program that makes 3D explosions when the user clicks."
// Date: February 14, 2023
// Code adapted from the following:
// - https://openprocessing.org/sketch/890654

// Globals
var particles = [];
let planarShockwaves = [];
let explosionClouds = [];
let BASE_BACKGROUND_COLOR;
let FLASH_BACKGROUND_COLOR;
let currBackgroundColorLerpValue = 0;

class particle{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.ded = false;
        this.vel = {
            x: random(-1, 1),
            y: random(-1, 1),
            z: random(-1, 1)
        };
        this.total = 0.5/(sqrt((this.vel.x*this.vel.x)+(this.vel.y*this.vel.y)+(this.vel.z*this.vel.z))+random(-0.9, -0.3));
        this.vel = {
            x: this.vel.x*this.total,
            y: this.vel.y*this.total,
            z: this.vel.z*this.total
        };
        this.color = random(50, 255);
        this.age = 0;
    }
    update(){
        this.age += random(0.2, 2);
        if(this.ded === false && 150<this.age){
            this.ded = true;
        }
        this.vel = {
            x: this.vel.x*random(0.99, 1.001),
            y: this.vel.y*random(0.99, 1.001),
            z: this.vel.z*random(0.99, 1.001)
        };
        this.x += this.vel.x;
        this.y += this.vel.y;
        this.z += this.vel.z;
        if(this.color<240){
            let greenColorValueOffset = 50 * (noise(frameCount / 20) - 0.5);
            fill(255, this.color + greenColorValueOffset, 0);
        }
        else{
            fill(this.color);
        }
        translate(this.x, this.y, this.z);
        sphere(10, 8, 4);
        translate(-this.x, -this.y, -this.z);
    }
}

class CenteredPlanarShockwave {
    constructor() {
        this.MAX_RADIUS = 1000;
        this.currentRadius = 0;
        this.growthRate = 10;
        this.xRot = 60 * (random() - 0.5); // Random x rotation from -30 degrees to 30 degrees
        this.yRot = 60 * (random() - 0.5);

        this.dead = false;
    }

    update() {
        this.currentRadius += this.growthRate;
        if (this.currentRadius > this.MAX_RADIUS) {
            this.dead = true;
            return;
        }

        fill(240);
        push();
        rotateX(this.xRot);
        rotateY(this.yRot);
        torus(this.currentRadius, 4);
        pop();
    }
}

class ExplosionCloud {
    constructor() {
        this.xScale = 1 + random(1,3);
        this.yScale = 1 + random(1,3);
        this.zScale = 1 + random(1,3);
        this.currentBaseRadius = 0;
        this.growthRate = 4;

        this.xRot = random(360);
        this.yRot = random(360);
        this.zRot = random(360);

        this.xRotInc = 10 * (random() - 0.5);
        this.yRotInc = 10 * (random() - 0.5);
        this.zRotInc = 10 * (random() - 0.5);

        this.currentAlpha = 255;

        this.dead = false;
    }

    update() {
        fill(216, this.currentAlpha);

        // Stop updating this ellipsoid if its color alpha value is less than or equal to 0
        this.currentAlpha -= 8;
        if (this.currentAlpha <= 0) {
            this.dead = true;
            return;
        }

        this.xRot += this.xRotInc;
        this.yRot += this.yRotInc;
        this.zRot += this.zRotInc;

        this.currentBaseRadius += this.growthRate;

        push();
        rotateX(this.xRot);
        rotateY(this.yRot);
        rotateZ(this.zRot);
        ellipsoid(this.xScale * this.currentBaseRadius, this.yScale * this.currentBaseRadius, this.zScale * this.currentBaseRadius);
        pop();
    }
}

// setup() function is called once when the program starts
function setup() {
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent("canvas-container");
    // resize canvas is the page is resized
    $(window).resize(function() {
        console.log("Resizing...");
        resizeCanvas(canvasContainer.width(), canvasContainer.height());
    });
    BASE_BACKGROUND_COLOR = color(51);
    FLASH_BACKGROUND_COLOR = color(255, 236, 196); // Very light orange

    angleMode(DEGREES);
    background(FLASH_BACKGROUND_COLOR);
    for(var i = 0; i<1000; i++){
        particles.push(new particle);
    }
    noStroke();

    planarShockwaves.push(new CenteredPlanarShockwave());
    explosionClouds.push(new ExplosionCloud());
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
    rotateX(-mouseY / 2);
    rotateY(mouseX / 2);
    offset = 0;

    currBackgroundColorLerpValue = min(currBackgroundColorLerpValue + 0.08, 1);
    background(lerpColor(FLASH_BACKGROUND_COLOR, BASE_BACKGROUND_COLOR, currBackgroundColorLerpValue));

    for(var i = 0; i<particles.length; i++){
        particles[i].update();
    }
    for(var i = 0; i<particles.length; i++){
        if(particles[i+offset].ded){
            particles.splice(i+offset, 1);
            offset--;
            i++;
        }
    }

    // Planar shockwaves
    let aliveShockwaves = [];
    for (let shockwave of planarShockwaves) {
        shockwave.update();
        if (shockwave.dead) {
            continue;
        }
        aliveShockwaves.push(shockwave);
    }
    planarShockwaves = aliveShockwaves;

    // Explosion clouds
    let aliveExplosionClouds = [];
    for (let cloud of explosionClouds) {
        cloud.update();
        if (cloud.dead) {
            continue;
        }
        aliveExplosionClouds.push(cloud);
    }
    explosionClouds = aliveExplosionClouds;
}

function mouseReleased() {
    for(var i = 0; i<500; i++){
        particles.push(new particle);
    }
    planarShockwaves.push(new CenteredPlanarShockwave());
    explosionClouds.push(new ExplosionCloud());
    background(FLASH_BACKGROUND_COLOR);
    currBackgroundColorLerpValue = 0;
}