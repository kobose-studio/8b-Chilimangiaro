let cols, rows;
let scl = 30; // Risoluzione della griglia
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
    background(5); // Nero assoluto
    
    flying -= 0.025; // Velocità della lava
    let yoff = flying;

    // Fix Matematico: Allineamento Mouse 2D a Spazio 3D
    let mappedMouseX = mouseX - width / 2;
    let mappedMouseY = mouseY - height / 2;

    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            
            // 1. IL VULCANO
            let centerX = cols / 2;
            let centerY = rows / 2;
            let distFromCenter = dist(x, y, centerX, centerY);
            let volcanoEffect = 500 / (1 + pow(distFromCenter * 0.15, 2));
            
            // 2. LA POSIZIONE REALE DEI PUNTI NELLO SPAZIO
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            let d = dist(actualX, actualY, mappedMouseX, mappedMouseY);
            
            let mouseRepulsion = 0;
            // HO RADDOPPIATO IL RAGGIO DI INTERAZIONE: ora reagisce in un'area enorme
            let heightTriggerRadius = 600; 
            
            if (d < heightTriggerRadius) { 
                mouseRepulsion = map(d, 0, heightTriggerRadius, 250, 0); 
            }

            // 3. RUMORE BASE
            let noiseVal = noise(xoff, yoff);
            terrain[x][y] = map(noiseVal, 0, 1, -50, 50) - volcanoEffect - mouseRepulsion;
            
            xoff += 0.1;
        }
        yoff += 0.1;
    }

    rotateX(PI / 2.6); 
    rotateZ(frameCount * 0.001); 
    translate(-w / 2, -h / 2);

    for (let y = 0; y < rows - 1; y++) {
        beginShape(POINTS); 
        for (let x = 0; x < cols; x++) {
            let z = terrain[x][y];
            
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            let mappedMouseX = mouseX - width / 2;
            let mappedMouseY = mouseY - height / 2;
            let dColor = dist(actualX, actualY, mappedMouseX, mappedMouseY);
            
            // AREA COLORE ESPANSA A QUASI TUTTO LO SCHERMO
            let colorTriggerRadius = 800; 

            if (dColor < colorTriggerRadius) {
                // IL RISVEGLIO DEL MAGMA
                let intensity = map(dColor, 0, colorTriggerRadius, 255, 50);
                stroke(214, 73, 51, intensity); // Rosso Magma
                strokeWeight(map(z, 0, -600, 3, 8)); 
            } else {
                // LA PENOMBRA (ora leggermente più visibile dall'inizio)
                stroke(60, 20, 20, 100); // Un reticolo fantasma rossastro
                strokeWeight(2); 
            }
            
            vertex(x * scl, y * scl, z);
        }
        endShape();
    }
}

// Ridimensionamento fluido senza far sparire nulla
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = floor(w / scl);
    rows = floor(h / scl);
}
