let cols, rows;
let scl = 15; // Scala più fine per definire meglio il vulcano
let w = 2000;
let h = 1000;
let flying = 0;
let terrain = [];

// Variabili per l'eruzione centrale
let eruptionRadius;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-container');
    
    cols = w / scl;
    rows = h / scl;
    
    for (let x = 0; x < cols; x++) {
        terrain[x] = [];
    }

    // Parametri eruttivi: il raggio d'azione del vulcano
    eruptionRadius = w / 4; 
}

function draw() {
    flying -= 0.03; // Velocità di scorrimento ridotta per un effetto più solido
    let yoff = flying;
    
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            
            // Calcoliamo la distanza di questo punto dal centro
            let dx = x * scl - w / 2;
            let dy = y * scl - h / 2;
            let d = sqrt(dx * dx + dy * dy);

            // Definiamo la "maschera eruttiva centrale"
            // Se d è minore del raggio d'eruzione, applichiamo un multiplier
            let mask = map(d, 0, eruptionRadius, 1, 0, true);
            mask = constrain(mask, 0, 1); // Assicuriamoci sia tra 0 e 1
            
            // L'altezza massima (il "potere eruttivo")
            // Aumenta con il mouseX, ma è concentrata al centro dal 'mask'
            let rawHeight = map(mouseX, 0, width, 100, 350); 
            let heightMultiplier = map(mask, 0, 1, 1, rawHeight);
            
            // Generiamo l'altimetria ponderata al centro
            terrain[x][y] = map(noise(xoff, yoff), 0, 1, -heightMultiplier/2, heightMultiplier);
            xoff += 0.15;
        }
        yoff += 0.15;
    }

    background(5); // Nero abissale
    stroke(255, 30); // Linee bianche fantasma, più sottili
    noFill();

    translate(0, 80);
    rotateX(PI / 2.5); // Angolatura più aggressiva per vedere il vulcano
    translate(-w / 2, -h / 2 + 300);

    // Disegniamo la montagna sonica
    for (let y = 0; y < rows - 1; y++) {
        beginShape(TRIANGLE_STRIP);
        for (let x = 0; x < cols; x++) {
            vertex(x * scl, y * scl, terrain[x][y]);
            vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
        }
        endShape();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
