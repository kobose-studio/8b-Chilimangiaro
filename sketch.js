// Variabili per la generazione del terreno (Perlin Noise)
let cols, rows;
let scl = 20; // Scala della griglia
let w = 2000; // Larghezza del terreno
let h = 1000; // Profondità
let flying = 0; // Variabile per far "volare" la telecamera
let terrain = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL); // Attiviamo l'accelerazione 3D
    canvas.parent('canvas-container'); // Inseriamo il canvas nel div corretto
    
    cols = w / scl;
    rows = h / scl;
    
    // Inizializziamo l'array bidimensionale per le altezze
    for (let x = 0; x < cols; x++) {
        terrain[x] = [];
    }
}

function draw() {
    flying -= 0.05; // Velocità di scorrimento in avanti
    let yoff = flying;
    
    // Generiamo l'altimetria usando il rumore di Perlin per simulare montagne
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            // Il mouse sull'asse X altera l'altezza delle montagne!
            let heightMultiplier = map(mouseX, 0, width, 50, 250); 
            terrain[x][y] = map(noise(xoff, yoff), 0, 1, -heightMultiplier, heightMultiplier);
            xoff += 0.2;
        }
        yoff += 0.2;
    }

    background(5); // Sfondo quasi nero
    stroke(255, 50); // Linee bianche con molta trasparenza (effetto wireframe fantasma)
    noFill();

    // Posizioniamo la telecamera
    translate(0, 50);
    rotateX(PI / 3); // Inkliniamo per vedere il "Chilimangiaro" dall'alto
    translate(-w / 2, -h / 2 + 200);

    // Disegniamo la montagna
    for (let y = 0; y < rows - 1; y++) {
        beginShape(TRIANGLE_STRIP);
        for (let x = 0; x < cols; x++) {
            vertex(x * scl, y * scl, terrain[x][y]);
            vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
        }
        endShape();
    }
}

// Se l'utente ridimensiona la finestra, riadattiamo la tela
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
