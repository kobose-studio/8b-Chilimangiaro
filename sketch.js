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
    // Fondo allineato con il CSS: Verde Profondo
    background('#064f34'); 
    
    flying -= 0.025; 
    let yoff = flying;

    // Mappatura pura da monitor a griglia per evitare sfalsamenti 3D
    let mouseGridX = map(mouseX, 0, width, 0, cols);
    let mouseGridY = map(mouseY, 0, height, rows * 0.1, rows * 0.9); // Compensiamo la prospettiva

    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            
            let centerX = cols / 2;
            let centerY = rows / 2;
            let distFromCenter = dist(x, y, centerX, centerY);
            let volcanoEffect = 500 / (1 + pow(distFromCenter * 0.15, 2));
            
            // LA NUOVA FISICA: L'Onda Orizzontale Totale
            // Moltiplicando dx per 0.01 annulliamo l'asse X dal calcolo della distanza.
            // L'area sensibile diventa una fascia che copre *tutto* lo schermo da sx a dx!
            let dx = (x - mouseGridX) * 0.01; 
            let dy = (y - mouseGridY) * 1.2; 
            let distFascia = sqrt(dx*dx + dy*dy);
            
            let mouseRepulsion = 0;
            let heightTriggerRadius = 15; // Raggio sulla griglia (ora è un raggio verticale)
            
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
    // Rotazione Z rimossa: era lei a spingere l'area sensibile fuori asse.
    translate(-w / 2, -h / 2);

    for (let y = 0; y < rows - 1; y++) {
        beginShape(POINTS); 
        for (let x = 0; x < cols; x++) {
            let z = terrain[x][y];
            
            let dx = (x - mouseGridX) * 0.01; 
            let dy = (y - mouseGridY) * 1.2; 
            let distFasciaColor = sqrt(dx*dx + dy*dy);
            
            let colorTriggerRadius = 22; // Ampiezza verticale della fascia magmatica

            if (distFasciaColor < colorTriggerRadius) {
                // IL MAGMA: L'onda rivelatrice rossa
                let intensity = map(distFasciaColor, 0, colorTriggerRadius, 255, 60);
                stroke(214, 73, 51, intensity); 
                strokeWeight(map(z, 0, -600, 3, 9)); // Punti più carnosi
            } else {
                // LA PENOMBRA: Ora molto più visibile e persistente
                // Un rosso traslucido che crea un contrasto poetico col verde fondo
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
}
