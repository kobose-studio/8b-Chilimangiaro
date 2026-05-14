let cols, rows;
let scl = 30; 
let w, h;
let flying = 0;
let terrain = [];

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
}

function draw() {
    clear(); 
    
    flying -= 0.025; 
    let yoff = flying;

    let mouseGridX = map(mouseX, 0, width, 0, cols);
    let mouseGridY = map(mouseY, 0, height, rows * 0.1, rows * 0.9); 
    
    // Leggiamo la potenza del suono dall'analizzatore (0 a 255)
    let amp = window.audioAmplitude || 0;

    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            
            let centerX = cols / 2;
            let centerY = rows / 2;
            let distFromCenter = dist(x, y, centerX, centerY);
            
            // LA DANZA DEL VULCANO: I bassi spingono la montagna più in alto
            let baseVolcano = 500;
            let audioBoost = map(amp, 0, 255, 0, 400); 
            let volcanoEffect = (baseVolcano + audioBoost) / (1 + pow(distFromCenter * 0.15, 2));
            
            let dx = (x - mouseGridX) * 0.01; 
            let dy = (y - mouseGridY) * 1.2; 
            let distFascia = sqrt(dx*dx + dy*dy);
            
            let mouseRepulsion = 0;
            let heightTriggerRadius = 15; 
            
            if (distFascia < heightTriggerRadius) { 
                mouseRepulsion = map(distFascia, 0, heightTriggerRadius, 250, 0); 
            }

            // JITTER SISMICO: Se l'audio suona, i punti vibrano freneticamente sul posto
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

    for (let y = 0; y < rows - 1; y++) {
        beginShape(POINTS); 
        for (let x = 0; x < cols; x++) {
            let z = terrain[x][y];
            
            let dx = (x - mouseGridX) * 0.01; 
            let dy = (y - mouseGridY) * 1.2; 
            let distFasciaColor = sqrt(dx*dx + dy*dy);
            
            let colorTriggerRadius = 22; 

            if (distFasciaColor < colorTriggerRadius) {
                // Durante l'audio, il colore rosso diventa più violento e accecante
                let extraRed = map(amp, 0, 255, 0, 40);
                let intensity = map(distFasciaColor, 0, colorTriggerRadius, 255, 60);
                stroke(214 + extraRed, 73, 51, intensity); 
                strokeWeight(map(z, 0, -600, 3, 9)); 
            } else {
                stroke(214, 73, 51, 60); 
                strokeWeight(3.5); 
            }
            
            vertex(x * scl, y * scl, z);
        }
        endShape();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = floor(w / scl);
    rows = floor(h / scl);
    terrain = []; 
    for (let x = 0; x < cols; x++) { terrain[x] = []; }
}
