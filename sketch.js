let pcam; // Instance of Peasycam
let lutURL1 =
  "https://raw.githubusercontent.com/coryallen/LUT-Visualizer/main/5x5x5_rgb_luma.cube";
let lutURL2 =
  "https://raw.githubusercontent.com/coryallen/LUT-Visualizer/main/3x3x3_rgb_luma_v2.cube";
let lut = null;
let lutStart = 0;
let lutText, lutTitle, lutLoc;
let pixelSize, gridSize;
let lutSize = 0;
let bypass = false;
let sbs = false;
let toggleButton, sbsButton, description1, description2;
let lutReady = false;
let canvas;
let regex = /[01]\.?\d*?(\s|$)/g;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  pcam = createEasyCam();
  //pixelDensity(1);

  // SET SIZE OF THE GRID BASED ON WINDOW SIZE
  gridSize = floor(min(width, height) / 4);

  // CREATE INFO ELEMENTS
  toggleButton = createButton("Toggle LUT");
  toggleButton.position(10, 80);
  toggleButton.mousePressed(toggleLUT);

  sbsButton = createButton("Toggle Side-by-Side");
  sbsButton.position(10, 110);
  sbsButton.mousePressed(toggleSBS);

  description1 = createDiv();
  description1.style("font-family", "Arial, Helvetica, sans-serif");
  description1.style("color", "#fff");
  description1.position(10, 10);
  description2 = createDiv();
  description2.style("font-family", "Arial, Helvetica, sans-serif");
  description2.style("color", "#fff");
  description2.position(10, height - 70);

  // LOAD EXAMPLE LUT
  loadLUT(lutURL1);

  // DROP EVENT TO LOAD NEW LUT
  canvas.drop(dropLUT);
}

function draw() {
  background(0);

  // DESCRIPTION AT BOTTOM OF WINDOW
  description1.html("LUT Name: " + lutTitle + "<br>Bypass LUT: " + bypass + "<br>Side-by-Side: " + !sbs);
  description2.html(
    "Drag and drop .CUBE LUT file onto this window to view.<br>Click/tap and drag to rotate. Double-click/tap to reset.<br>Press '1' and '2' to load sample LUTs."
  );

  //  DRAW DEBUG AXES
  // stroke(255, 0, 0);
  // line(0, 0, 0, 100, 0, 0); // X Axis - Red
  // stroke(0, 255, 0);
  // line(0, 0, 0, 0, 100, 0); // Y-Axis - Green
  // stroke(0, 0, 255);
  // line(0, 0, 0, 0, 0, 100); // Z-Axis - Blue

  // DRAW PIXELS
  if (lut != null) {
    for (x = 0; x < lut.length; x++) {
      for (y = 0; y < lut[x].length; y++) {
        for (z = 0; z < lut[x][y].length; z++) {
          let cPix = lut[x][y][z];
          if (sbs) {
            push();
            let f = pixelSize * 1.5;
            translate(
              x * f - gridSize / 2,
              y * f - gridSize / 2,
              z * -f + gridSize / 2
            );

            noStroke();
            let c = 255;
            if (bypass) {
              fill(
                (x * c) / (lutSize - 1),
                (y * c) / (lutSize - 1),
                (z * c) / (lutSize - 1)
              );
            } else {
              fill(cPix.r * c, cPix.g * c, cPix.b * c);
            }
            box(pixelSize, pixelSize, pixelSize);
            pop();
          } else {
            push();
            let f = pixelSize * 1.5;
            translate(
              x * f - gridSize / 2 - pixelSize / 4,
              y * f - gridSize / 2,
              z * -f + gridSize / 2
            );
            noStroke();
            let c = 255;

            // BYPASS HALF
            fill(
              (x * c) / (lutSize - 1),
              (y * c) / (lutSize - 1),
              (z * c) / (lutSize - 1)
            );
            box(pixelSize / 2, pixelSize, pixelSize);

            // LUT HALF
            translate(pixelSize / 2, 0, 0);
            if (bypass) {
              fill(
                (x * c) / (lutSize - 1),
                (y * c) / (lutSize - 1),
                (z * c) / (lutSize - 1)
              );
            } else {
              fill(cPix.r * c, cPix.g * c, cPix.b * c);
            }
            box(pixelSize / 2, pixelSize, pixelSize);
            pop();
          }
        }
      }
    }
  }
}

// RUNS WHEN LUT FILE IS DROPPED ONTO CANVAS
function dropLUT(file) {
  console.log("Loading LUT from drop event");
  lutText = loadStrings(file.data, function callback() {
    updateLUT(), console.log("LUT Ready");
  });
}

// RUNS WHEN LUT IS GRABBED FROM URL
function loadLUT(url) {
  console.log("Loading LUT from URL: " + url);
  lutText = loadStrings(url, function callback() {
    updateLUT(), console.log("LUT Ready");
  });
}

// LOADS NEW LUT DATA INTO 3D ARRAY
function updateLUT() {
  //console.log(lutText);

  // DETERMINE LOCATION OF LUT TITLE
  let lutTitleLoc = null;
  for (i = 0; i < lutText.length; i++) {
    if (lutText[i].match(/TITLE/) != null) {
      lutTitleLoc = i;
    }
  }

  lutTitle = lutText[lutTitleLoc].match(/\s.+/);

  // DETERMINE LOCATION OF LUT SIZE
  for (i = 0; i < lutText.length; i++) {
    if (lutText[i].match(/SIZE/) != null) {
      lutLoc = i;
      //console.log("LUT Size Location: " + lutLoc);
      break;
    }
  }

  // DETERMINE LUT SIZE
  lutSize = lutText[lutLoc].match(/\d+$/);
  pixelSize = floor(gridSize / lutSize);
  console.log("LUT Size Location: " + lutLoc + " - LUT size: " + lutSize);
  //console.log("grid size: " + gridSize);
  //console.log("pixel size: " + pixelSize);

  // LOCATE START OF LUT VALUES
  for (i = 0; i < lutText.length; i++) {
    let rtest = lutText[i].match(/[01]\.?\d*\s[01]\.?\d*\s[01]\.?\d*/);
    if (rtest != null) {
      lutStart = i;
      break;
    }
  }
  console.log("LUT Values Start: " + lutStart + " - " + lutText[lutStart]);

  // LOAD LUT VALUES INTO 3D ARRAY
  lut = [];
  for (x = 0; x < lutSize; x++) {
    lut.push([]);
    for (y = 0; y < lutSize; y++) {
      lut[x].push([]);
      for (z = 0; z < lutSize; z++) {
        let rowIndex = x + y * lutSize + z * lutSize * lutSize + lutStart;
        let rowValues = lutText[rowIndex].match(regex);
        let r = float(rowValues[0]);
        let g = float(rowValues[1]);
        let b = float(rowValues[2]);
        lut[x][y][z] = new lutPixel(r, g, b);
      }
    }
  }
}

// KEYBINDS TO LOAD SAMPLE LUTS
function keyPressed() {
  if (key == "1") {
    loadLUT(lutURL1);
  } else if (key == "2") {
    loadLUT(lutURL2);
  }
}

function toggleLUT() {
  bypass = !bypass;
}

function toggleSBS() {
  sbs = !sbs;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
