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

    // Inizializzazione della matrice del terreno
    for (let x = 0; x < cols; x++) {
        terrain[x] = [];
    }
}

function draw() {
    // L'INTUIZIONE ALCHEMICA DI SEB:
    // clear() rende il canvas trasparente, lasciando emergere il verde #064f34 dal CSS!
    clear(); 
    
    flying -= 0.025; 
    let yoff = flying;

    let mouseGridX = map(mouseX, 0, width, 0, cols);
    let mouseGridY = map(mouseY, 0, height, rows * 0.1, rows * 0.9); 

    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            
            let centerX = cols / 2;
            let centerY = rows / 2;
            let distFromCenter = dist(x, y, centerX, centerY);
            let volcanoEffect = 500 / (1 + pow(distFromCenter * 0.15, 2));
            
            let dx = (x - mouseGridX) * 0.01; 
            let dy = (y - mouseGridY) * 1.2; 
            let distFascia = sqrt(dx*dx + dy*dy);
            
            let mouseRepulsion = 0;
            let heightTriggerRadius = 15; 
            
            if (distFascia < heightTriggerRadius) { 
                mouseRepulsion = map(distFascia, 0, heightTriggerRadius, 250, 0); 
            }

            let noiseVal = noise(xoff, yoff);
            terrain[x][y] = map(noiseVal, 0, 1, -50, 50) - volcanoEffect - mouseRepulsion;
            
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
                let intensity = map(distFasciaColor, 0, colorTriggerRadius, 255, 60);
                stroke(214, 73, 51, intensity); 
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

// IL FIX DELLA MATRICE
function windowResized() {
    // 1. Ridimensioniamo il canvas visivo
    resizeCanvas(windowWidth, windowHeight);
    
    // 2. Ricalcoliamo l'ampiezza virtuale
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = floor(w / scl);
    rows = floor(h / scl);

    // 3. LA CURA: Dobbiamo rigenerare l'array 'terrain' per le nuove dimensioni!
    terrain = []; // Svuotiamo la vecchia memoria
    for (let x = 0; x < cols; x++) {
        terrain[x] = []; // Creiamo i nuovi spazi per evitare il crash
    }
}
