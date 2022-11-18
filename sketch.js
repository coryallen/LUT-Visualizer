let pcam; // Instance of Peasycam
let lut = [];
let table;
let pixelSize;
let lutSize = 5; 
let bypass = false;
let button;
let description;

function preload() {
  table = loadTable("5x5x5.csv", "csv");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  pcam = createEasyCam();

  pixelSize = width / lutSize / 4;

  // LOAD LUT CSV INTO 3D ARRAY
  for (x = 0; x < lutSize; x++) {
    lut.push([]);
    for (y = 0; y < lutSize; y++) {
      lut[x].push([]);
      for (z = 0; z < lutSize; z++) {
        let row = x + y * lutSize + z * lutSize * lutSize;
        let r = table.get(row, 0);
        let g = table.get(row, 1);
        let b = table.get(row, 2);
        lut[x][y].push([]);
        lut[x][y][z] = new lutPixel(x, y, z, r, g, b);
      }
    }
  }

  button = createButton("Toggle LUT");
  button.position(10, 70);
  button.mousePressed(toggleLUT);

  description = createDiv(
    
  );
  description.style("font-family", "Arial, Helvetica, sans-serif");
  description.style("color", "#fff");
  description.position(10, 10);

  //console.log(lut);
}

function draw() {
  background(0);
  
  description.html(
    "Click/tap and drag to rotate.<br>Double-click/tap to reset.<br>LUT bypassed: " + bypass);

  // DRAW AXES
  // stroke(255, 0, 0);
  // line(0, 0, 0, 100, 0, 0); // X Axis - Red
  // stroke(0, 255, 0);
  // line(0, 0, 0, 0, 100, 0); // Y-Axis - Green
  // stroke(0, 0, 255);
  // line(0, 0, 0, 0, 0, 100); // Z-Axis - Blue

  // DRAW PIXELS
  for (x = 0; x < lut.length; x++) {
    for (y = 0; y < lut[x].length; y++) {
      for (z = 0; z < lut[x][y].length; z++) {
        push();
        let f = pixelSize * 1.5;
        translate(
          lut[x][y][z].x * f - width / 8 - pixelSize/2,
          lut[x][y][z].y * f - height / 8 - pixelSize/2,
          lut[x][y][z].z * -f + width / 8
        );
        noStroke();
        let c = 255;
        if (bypass) {
          fill(
            (x * c) / (lutSize-1),
            (y * c) / (lutSize-1),
            (z * c) / (lutSize-1)
          );
        } else {
          fill(lut[x][y][z].r * c, lut[x][y][z].g * c, lut[x][y][z].b * c);
        }
        box(pixelSize, pixelSize, pixelSize);
        pop();
      }
    }
  }
}

function toggleLUT() {
  bypass = !bypass;
}
