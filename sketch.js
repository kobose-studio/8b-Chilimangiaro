// IL VULCANO DEI PUNTINI DINAMICI (Creative Coding)
// Idea: punti verdi di base, rossi all'eruzione/passaggio mouse su fondo nero.
let cols, rows;
let scl = 30; // Distanza tra i singoli puntini
let w, h;
let flying = 0;
let terrain = [];

function setup() {
    // Inizializziamo il mondo in 3D con accelerazione WebGL
    // Il canvas si inietta nel div 'canvas-container'
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
    // FONDO NERO per il canvas dei punti
    // Questo è il trucco per separare lo sfondo globale crema da quello dei punti.
    background(5); // Puliamo lo schermo con un grigio quasi nero
    
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
            let colorTriggerRadius = 300; // Raggio per l'eruzione del colore
            let heightTriggerRadius = 300; // Raggio per l'eruzione dell'altezza
            
            if (d < heightTriggerRadius) { // Se il mouse è vicino al punto, lo solleva
                mouseRepulsion = map(d, 0, heightTriggerRadius, 150, 0); 
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

    // Disegniamo i puntini dinamici con la nuova fisica verde/rossa
    for (let y = 0; y < rows - 1; y++) {
        beginShape(POINTS); // Eccola, l'interazione fantastica a puntini
        for (let x = 0; x < cols; x++) {
            let z = terrain[x][y];
            
            // 2. INTERAZIONE DEL MOUSE per il colore
            let mappedMouseX = map(mouseX, 0, width, -w/2, w/2);
            let mappedMouseY = map(mouseY, 0, height, -h/2, h/2);
            let dColor = dist(x * scl - w/2, y * scl - h/2, mappedMouseX, mappedMouseY);
            let colorTriggerRadius = 300; // Raggio per l'eruzione del colore

            if (dColor < colorTriggerRadius) {
                // ROSSO ERUZIONE! (percorrerò diverse tonalità di rosso)
                stroke(map(z, 0, -600, 214, 255), 73, 51, map(z, 0, -600, 40, 255));
                strokeWeight(map(z, 0, -600, 3, 9)); 
            } else {
                // VERDE DI BASE! (percorrerò diverse tonalità di verde)
                // Colore dinamico: i picchi sono più scuri (verde foresta), le valli sfumano
                stroke(13, 40, 24, map(z, 0, -600, 40, 255)); 
                strokeWeight(map(z, 0, -600, 2, 7)); 
            }
            
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
