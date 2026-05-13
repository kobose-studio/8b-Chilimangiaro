// IL VULCANO DEI PUNTINI (Creative Coding)
let cols, rows;
let scl = 30; // Distanza tra i singoli puntini
let w, h;
let flying = 0;
let terrain = [];

function setup() {
    // Inizializziamo il mondo in 3D
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-container');
    
    // Griglia più ampia dello schermo per non vedere i bordi
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = w / scl;
    rows = h / scl;

    for (let x = 0; x < cols; x++) {
        terrain[x] = [];
    }
}

function draw() {
    background(242, 232, 207); // Puliamo lo schermo con il color crema vintage
    
    flying -= 0.02; // Avanzamento costante nel tempo
    let yoff = flying;

    // Calcoliamo la matematica di ogni singolo punto
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            
            // 1. IL VULCANO: Calcolo distanza dal centro
            let centerX = cols / 2;
            let centerY = rows / 2;
            let distFromCenter = dist(x, y, centerX, centerY);
            // Più sei vicino al centro, più si innalza la montagna
            let volcanoEffect = 600 / (1 + pow(distFromCenter * 0.15, 2));
            
            // 2. INTERAZIONE DEL MOUSE: I puntini reagiscono al cursore
            let mappedMouseX = map(mouseX, 0, width, -w/2, w/2);
            let mappedMouseY = map(mouseY, 0, height, -h/2, h/2);
            let d = dist(x * scl - w/2, y * scl - h/2, mappedMouseX, mappedMouseY);
            
            let mouseRepulsion = 0;
            if (d < 300) { // Se il mouse è vicino al punto
                mouseRepulsion = map(d, 0, 300, 150, 0); // Lo spinge via / lo innalza
            }

            // 3. RUMORE ORGANICO
            let noiseVal = noise(xoff, yoff);
            
            // Z finale = rumore base - vulcano - repulsione del mouse
            terrain[x][y] = map(noiseVal, 0, 1, -50, 50) - volcanoEffect - mouseRepulsion;
            
            xoff += 0.1;
        }
        yoff += 0.1;
    }

    // Posizioniamo la telecamera
    rotateX(PI / 2.6); // Inclinazione per vedere la prospettiva
    rotateZ(frameCount * 0.001); // Lenta rotazione ipnotica stile vinile
    translate(-w / 2, -h / 2);

    // Disegniamo i puntini dinamici
    for (let y = 0; y < rows - 1; y++) {
        beginShape(POINTS); // Eccola, l'interazione fantastica a puntini
        for (let x = 0; x < cols; x++) {
            let z = terrain[x][y];
            
            // Colore dinamico: i picchi (Z molto negativo) sono arancio puro, le valli sfumano
            stroke(214, 73, 51, map(z, 0, -600, 40, 255)); 
            
            // Spessore dinamico: i punti sul vulcano sono più grossi
            strokeWeight(map(z, 0, -600, 2, 7)); 
            
            vertex(x * scl, y * scl, z);
        }
        endShape();
    }
}

// Ridimensionamento fluido se la finestra cambia
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = w / scl;
    rows = h / scl;
}
