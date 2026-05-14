let cols, rows;
let scl = 30; 
let w, h;
let flying = 0;
let terrain = [];

// REINTRODUZIONE DELLE PARTICELLE DINAMICHE
let particles = [];
let numParticles = 150; // Quanti puntini fluttuanti

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-container');
    
    w = windowWidth * 1.5;
    h = windowHeight * 1.5;
    cols = floor(w / scl);
    rows = floor(h / scl);

    // Griglia 3D WebGL (La Vetta)
    for (let x = 0; x < cols; x++) {
        terrain[x] = [];
    }

    // Inizializzazione Particolati Dinamici (The Rogue Particles)
    resetParticles();
}

function draw() {
    clear(); 
    
    flying -= 0.025; 
    let yoff = flying;

    // Coordinate del mouse rispetto al centro per la Vetta 3D
    let mappedMouseX = mouseX - width / 2;
    let mappedMouseY = mouseY - height / 2;
    
    let amp = window.audioAmplitude || 0;

    // --- GRIGLIA 3D WEBGL (La Vetta Dinamica) ---
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
            
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            
            // Interazione schiacciata in orizzontale
            let distEllitticaHeight = sqrt(pow(actualX - mappedMouseX, 2) + pow((actualY - mappedMouseY) * 2.5, 2));
            
            let mouseRepulsion = 0;
            let heightTriggerRadius = 800; // Area molto ampia

            if (distEllitticaHeight < heightTriggerRadius) { 
                mouseRepulsion = map(distEllitticaHeight, 0, heightTriggerRadius, 250, 0); 
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
        beginShape(POINTS); // Punti WebGL che formano il terreno
        for (let x = 0; x < cols; x++) {
            let z = terrain[x][y];
            
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            
            // Stessa logica ellittica per il colore
            let distEllitticaColor = sqrt(pow(actualX - mappedMouseX, 2) + pow((actualY - mappedMouseY) * 2.5, 2));
            let colorTriggerRadius = 900; // Area molto ampia

            if (distEllitticaColor < colorTriggerRadius) {
                // Durante l'audio, il colore rosso diventa più violento e accecante
                let extraRed = map(amp, 0, 255, 0, 40);
                let intensity = map(distEllitticaColor, 0, colorTriggerRadius, 255, 120);
                stroke(214 + extraRed, 73, 51, intensity); // Rosso Magma
                strokeWeight(map(z, 0, -600, 3, 9)); 
            } else {
                // Penombra più visibile e materica
                stroke(150, 40, 30, 180); // Rosso mattone semi-trasparente
                strokeWeight(3.5); 
            }
            
            vertex(x * scl, y * scl, z);
        }
        endShape();
    }

    // --- PARTICOLATI DINAMICI (The Rogue Particles) ---
    // Questi puntini fluttuano nello spazio 3D indipendentemente dal terreno
    push();
    translate(w / 2, h / 2); // Li centralizziamo rispetto alla matrice terreno
    particles.forEach(p => { p.update(amp); p.draw(); });
    pop();
}

// Classe per i Particolati Dinamici (Rogue Engine p5.js Edition)
class Particle {
    constructor() { this.init(true); }
    init(randomZ = false) {
        // Nascono a caso nello spazio virtuale
        this.x = random(-w / 2, w / 2);
        this.y = random(-h / 2, h / 2);
        // Se è l'init iniziale, partono sparsi, altrimenti nascono dal fondo vulcano
        this.z = randomZ ? random(-600, 0) : random(-600, -500); 
        this.size = random(2, 6);
        // Velocità organica
        this.velocityX = random(-0.5, 0.5);
        this.velocityY = random(-0.5, 0.5);
        this.velocityZ = random(0.2, 1); // Salgono
        // Trasparenza organica (penombra)
        this.alpha = random(40, 180);
        this.baseZ = this.z;
    }
    update(amp) {
        // JITTER SONORO SULLE PARTICELLE: Scuoti se c'è suono
        let jitterX = map(amp, 0, 255, 0, 3) * (random() > 0.5 ? 1 : -1);
        let jitterY = map(amp, 0, 255, 0, 3) * (random() > 0.5 ? 1 : -1);
        
        this.x += this.velocityX + jitterX;
        this.y += this.velocityY + jitterY;
        // Salgono, accelerate dai bassi
        this.z += this.velocityZ + map(amp, 0, 255, 0, 2); 

        // Se escono dallo spazio virtuale, rinascono dal fondo
        if (this.z > 50) this.init();
        if (this.x < -w / 2 || this.x > w / 2) this.init();
        if (this.y < -h / 2 || this.y > h / 2) this.init();
    }
    draw() {
        // Colore penombra, si accendono con l'audio (bassi)
        let amp = window.audioAmplitude || 0;
        let redBoost = map(amp, 0, 255, 0, 100);
        // Un mix tra il verde smeraldo e il rosso magma
        stroke(214 + redBoost, 73, 51, this.alpha);
        strokeWeight(this.size);
        point(this.x, this.y, this.z);
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
    resetParticles(); // Rigenera le particelle al resize
}
