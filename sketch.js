let cols, rows;
let scl = 30; 
let w, h;
let flying = 0;
let terrain = [];

// PARTICELLE DINAMICHE
let particles = [];
let numParticles = 150; 

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-container');
    
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = floor(w / scl);
    rows = floor(h / scl);

    for (let x = 0; x < cols; x++) {
        terrain[x] = [];
    }

    resetParticles();
}

function draw() {
    clear(); 
    
    flying -= 0.025; 
    let yoff = flying;

    let mouseGridX = map(mouseX, 0, width, 0, cols);
    let mouseGridY = map(mouseY, 0, height, rows * 0.1, rows * 0.9); 
    
    let amp = window.audioAmplitude || 0;

    // --- GRIGLIA 3D WEBGL ---
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            
            let centerX = cols / 2;
            let centerY = rows / 2;
            let distFromCenter = dist(x, y, centerX, centerY);
            
            let baseVolcano = 500;
            let audioBoost = map(amp, 0, 255, 0, 400); 
            let volcanoEffect = (baseVolcano + audioBoost) / (1 + pow(distFromCenter * 0.15, 2));
            
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            
            let distEllitticaHeight = sqrt(pow(actualX - mappedMouseX, 2) + pow((actualY - mappedMouseY) * 2.5, 2));
            
            let mouseRepulsion = 0;
            let heightTriggerRadius = 800; 

            if (distEllitticaHeight < heightTriggerRadius) { 
                mouseRepulsion = map(distEllitticaHeight, 0, heightTriggerRadius, 250, 0); 
            }

            let jitter = 0;
            if (amp > 10) { jitter = random(-amp * 0.1, amp * 0.1); }

            let noiseVal = noise(xoff, yoff);
            terrain[x][y] = map(noiseVal, 0, 1, -50, 50) - volcanoEffect - mouseRepulsion + jitter;
            
            xoff += 0.1;
        }
        yoff += 0.1;
    }

    rotateX(PI / 2.6); 
    translate(-w / 2, -h / 2);

    // Disegno la Griglia
    for (let y = 0; y < rows - 1; y++) {
        beginShape(POINTS); 
        for (let x = 0; x < cols; x++) {
            let z = terrain[x][y];
            
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            let mappedMouseX = mouseX - width / 2;
            let mappedMouseY = mouseY - height / 2;
            
            let distEllitticaColor = sqrt(pow(actualX - mappedMouseX, 2) + pow((actualY - mappedMouseY) * 2.5, 2));
            let colorTriggerRadius = 900; 

            if (distEllitticaColor < colorTriggerRadius) {
                let extraRed = map(amp, 0, 255, 0, 40);
                let intensity = map(distEllitticaColor, 0, colorTriggerRadius, 255, 120);
                stroke(214 + extraRed, 73, 51, intensity); 
                strokeWeight(map(z, 0, -600, 3, 9)); 
            } else {
                stroke(150, 40, 30, 180); 
                strokeWeight(3.5); 
            }
            
            vertex(x * scl, y * scl, z);
        }
        endShape();
    }

    // --- PARTICOLATI DINAMICI (Fix anti-glitch Safari/Webkit) ---
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
        this.size = random(2, 6); // Dimensione visibile
        this.velocityX = random(-1, 1);
        this.velocityY = random(-1, 1);
        this.velocityZ = random(1, 3); 
        this.alpha = random(100, 255);
    }
    update(amp) {
        let jitterX = map(amp, 0, 255, 0, 5) * (random() > 0.5 ? 1 : -1);
        let jitterY = map(amp, 0, 255, 0, 5) * (random() > 0.5 ? 1 : -1);
        
        this.x += this.velocityX + jitterX;
        this.y += this.velocityY + jitterY;
        this.z += this.velocityZ + map(amp, 0, 255, 0, 3); 

        if (this.z > 200) this.init();
        if (this.x < -w / 2 || this.x > w / 2) this.init();
        if (this.y < -h / 2 || this.y > h / 2) this.init();
    }
    draw() {
        let amp = window.audioAmplitude || 0;
        let redBoost = map(amp, 0, 255, 0, 41); // 214+41 = 255 (Rosso puro)
        
        push();
        translate(this.x, this.y, this.z);
        noStroke();
        // Disegniamo veri e propri solidi 3D (sfere) invece di "punti"
        // Questo aggira per sempre il limite di Safari
        fill(214 + redBoost, 73, 51, this.alpha);
        sphere(this.size, 4, 4); // Sfera low-poly, fluida ma visibile!
        pop();
    }
}

function resetParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) particles.push(new Particle());
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = floor(w / scl);
    rows = floor(h / scl);
    terrain = []; 
    for (let x = 0; x < cols; x++) { terrain[x] = []; }
    resetParticles(); 
}
