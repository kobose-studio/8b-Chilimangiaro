let cols, rows;
let scl = 30; 
let w, h;
let flying = 0;
let terrain = [];
let particles = [];
let numParticles = 180; 

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-container');
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = floor(w / scl);
    rows = floor(h / scl);
    for (let x = 0; x < cols; x++) { terrain[x] = []; }
    resetParticles();
}

function draw() {
    clear(); // Rende il canvas trasparente per mostrare il verde CSS
    
    flying -= 0.025; 
    let yoff = flying;
    let mappedMouseX = mouseX - width / 2;
    let mappedMouseY = mouseY - height / 2;
    let amp = window.audioAmplitude || 0;

    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            let centerX = cols / 2;
            let centerY = rows / 2;
            let distFromCenter = dist(x, y, centerX, centerY);
            let volcanoEffect = (500 + map(amp, 0, 255, 0, 400)) / (1 + pow(distFromCenter * 0.15, 2));
            
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            let distEllittica = sqrt(pow(actualX - mappedMouseX, 2) + pow((actualY - mappedMouseY) * 2.5, 2));
            let mouseRepulsion = distEllittica < 800 ? map(distEllittica, 0, 800, 250, 0) : 0;

            let jitter = amp > 10 ? random(-amp * 0.1, amp * 0.1) : 0;
            terrain[x][y] = map(noise(xoff, yoff), 0, 1, -50, 50) - volcanoEffect - mouseRepulsion + jitter;
            xoff += 0.1;
        }
        yoff += 0.1;
    }

    rotateX(PI / 2.6); 
    translate(-w / 2, -h / 2);

    for (let y = 0; y < rows - 1; y++) {
        beginShape(POINTS); 
        for (let x = 0; x < cols; x++) {
            let z = terrain[x][y];
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            let distEllitticaColor = sqrt(pow(actualX - (mouseX - width/2), 2) + pow((actualY - (mouseY - height/2)) * 2.5, 2));

            if (distEllitticaColor < 900) {
                stroke(214 + map(amp, 0, 255, 0, 41), 73, 51, map(distEllitticaColor, 0, 900, 255, 120));
                strokeWeight(map(z, 0, -600, 3, 9)); 
            } else {
                stroke(150, 40, 30, 180); 
                strokeWeight(3.5); 
            }
            vertex(x * scl, y * scl, z);
        }
        endShape();
    }

    push();
    translate(w / 2, h / 2); 
    particles.forEach(p => { p.update(amp); p.draw(); });
    pop();
}

class Particle {
    constructor() { this.init(true); }
    init(randomZ = false) {
        this.x = random(-w / 2, w / 2);
        this.y = random(-h / 2, h / 2);
        this.z = randomZ ? random(-600, 100) : random(-600, -500); 
        this.size = random(2, 5);
        this.velocityX = random(-1, 1);
        this.velocityY = random(-1, 1);
        this.velocityZ = random(1, 3); 
        this.alpha = random(150, 255);
    }
    update(amp) {
        this.x += this.velocityX + (map(amp, 0, 255, 0, 5) * (random() > 0.5 ? 1 : -1));
        this.y += this.velocityY + (map(amp, 0, 255, 0, 5) * (random() > 0.5 ? 1 : -1));
        this.z += this.velocityZ + map(amp, 0, 255, 0, 3); 
        if (this.z > 200 || abs(this.x) > w/2 || abs(this.y) > h/2) this.init();
    }
    draw() {
        push();
        translate(this.x, this.y, this.z);
        noStroke();
        fill(214 + map(window.audioAmplitude || 0, 0, 255, 0, 41), 73, 51, this.alpha);
        sphere(this.size, 4, 4); // Solidi 3D per massima visibilità
        pop();
    }
}

function resetParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) particles.push(new Particle());
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    w = windowWidth * 1.5; h = windowHeight * 1.5;
    cols = floor(w / scl); rows = floor(h / scl);
    terrain = []; 
    for (let x = 0; x < cols; x++) { terrain[x] = []; }
    resetParticles(); 
}
