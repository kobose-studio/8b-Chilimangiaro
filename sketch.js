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
    background(5); 
    
    flying -= 0.025; 
    let yoff = flying;

    // Coordinate del mouse rispetto al centro
    let mappedMouseX = mouseX - width / 2;
    let mappedMouseY = mouseY - height / 2;

    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            
            let centerX = cols / 2;
            let centerY = rows / 2;
            let distFromCenter = dist(x, y, centerX, centerY);
            let volcanoEffect = 500 / (1 + pow(distFromCenter * 0.15, 2));
            
            let actualX = x * scl - w/2;
            let actualY = y * scl - h/2;
            
            // LA NUOVA FISICA: Interazione schiacciata in orizzontale
            // Moltiplichiamo la Y per "schiacciare" l'area di interazione
            // Questo crea un'ellisse allungata orizzontalmente
            let distEllitticaHeight = sqrt(pow(actualX - mappedMouseX, 2) + pow((actualY - mappedMouseY) * 2.5, 2));
            
            let mouseRepulsion = 0;
            let heightTriggerRadius = 800; // Raggio di base espanso
            
            if (distEllitticaHeight < heightTriggerRadius) { 
                mouseRepulsion = map(distEllitticaHeight, 0, heightTriggerRadius, 250, 0); 
            }

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
            
            // Stessa logica ellittica per il colore
            let distEllitticaColor = sqrt(pow(actualX - mappedMouseX, 2) + pow((actualY - mappedMouseY) * 2.5, 2));
            let colorTriggerRadius = 900; // Area molto ampia

            if (distEllitticaColor < colorTriggerRadius) {
                let intensity = map(distEllitticaColor, 0, colorTriggerRadius, 255, 120);
                stroke(214, 73, 51, intensity); // Rosso Magma
                strokeWeight(map(z, 0, -600, 3, 8)); 
            } else {
                // LA PENOMBRA PIU' VISIBILE
                stroke(150, 40, 30, 180); // Rosso mattone semi-trasparente e più forte
                strokeWeight(3); // Leggermente più spesso
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
