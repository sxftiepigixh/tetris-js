let score = 0;
let level = 1;
let lines = 0;
let popupText = "";
let popupTimer = 0;

document.getElementById("cuminza").addEventListener("click", () => {
  resetGame();
});

document.getElementById("chisiamo").addEventListener("click", () => {
  showCredits = !showCredits;
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function creaTetrimini() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (sequence.length) {
        const caso = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(caso, 1)[0];
        pezzoSequence.push(name);
    }
}

function avantiUnAltro() {
    while (pezzoSequence.length === 0) {
        creaTetrimini();
    }

    const name = pezzoSequence.shift();
    const matrix = tetrimini[name];

    const col = Math.floor(playfield[0].length / 2 - matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;

    return { name, matrix, row, col };
}

function rotate(matrix) {
    const N = matrix.length - 1;

    return matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
}

function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                playfield[cellRow + row]?.[cellCol + col]
            )) {
                return false;
            }
        }
    }

    return true;
}

function piazzaBlocco() {

  for (let row = 0; row < tetrimino.matrix.length; row++) {
    for (let col = 0; col < tetrimino.matrix[row].length; col++) {
      if (tetrimino.matrix[row][col]) {
        if (tetrimino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetrimino.row + row][tetrimino.col + col] = tetrimino.name;
      }
    }
  }

  toBeDelRow = [];

  for (let row = playfield.length - 1; row >= 0; row--) {
    if (playfield[row].every(cell => cell !== 0)) {
      toBeDelRow.push(row);
    }
  }

  if (toBeDelRow.length > 0) {
    animeLinee = true;
    frameAniLinee = 0;
    return;
  }

  tetrimino = avantiUnAltro();
  puoSalvare = true;
}

function getGhostPosition() {
    let ghostRow = tetrimino.row;

    while (isValidMove(tetrimino.matrix, ghostRow + 1, tetrimino.col)) {
        ghostRow++;
    }

    return ghostRow;
}

function aniLinee() {
  frameAniLinee++;

  const blinkgone = Math.floor(frameAniLinee / 5) % 2 === 0;

  toBeDelRow.forEach(row=> {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = blinkgone ? colors[playfield[row][col]] : "white";
      ctx.fillRect(col * grid, row * grid, grid-1, grid-1);
    }
  });

  if (frameAniLinee > 20) {
    pulisciDing();
    animeLinee = false;
  }
}

function pulisciDing() {
  let rainKuria = toBeDelRow.length;

  toBeDelRow.forEach(row => {
    for (let r = row; r > 0; r--) {
      for (let c = 0; c < COLS; c++) {
        playfield[r][c] = playfield[r - 1][c];
      }
    }

    for (let c = 0; c < COLS; c++) {
      playfield[0][c] = 0;
    }
  });

  const linesCleared = rainKuria;

  if (linesCleared >= 5) {
    showPopup("TETRIS!");
  }

  let empty = playfield.every(row => row.every(cell => cell === 0));

  if (empty) {
    showPopup("ALL CLEAR!");
  }

  const points = [0, 100, 300, 500, 800];
  score += points[rainKuria] * level;
  lines += rainKuria;
  level = Math.floor(lines / 10) + 1;

  tetrimino = avantiUnAltro();
  puoSalvare = true;
}


function showPopup(text) {
  popupText = text;
  popupTimer = 60;
}

function drawPezzoMinicicciolo(matrix, offsetX, offsetY) {
  const size = 16;

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        ctx.fillRect(
          offsetX + col * size,
          offsetY + row * size,
          size - 1,
          size - 1
        );
      }
    }
  }
}

function drawAnteprima() {
  const ante = pezzoSequence.slice(-5);

  ante.forEach((name, i) => {
    ctx.fillStyle = colors[name];
    drawPezzoMinicicciolo(tetrimini[name], COLS * grid + 20, 50 + i * 70);
  });
}

function salva() {
  if (!puoSalvare) return;

  if (pezzoSalvato === null) {
    pezzoSalvato = {
      name: tetrimino.name,
      matrix: tetrimini[tetrimino.name],
    };
    tetrimino = avantiUnAltro();
  } else {
    const temp = pezzoSalvato;

    pezzoSalvato = {
      name: tetrimino.name,
      matrix: tetrimini[tetrimino.name],
    };

    tetrimino = {
      name: temp.name,
      matrix: tetrimini[temp.name],
      row: temp.name === 'I' ? -1 : -2,
      col: Math.floor(playfield[0].length / 2 - tetrimini[temp.name][0].length / 2)
    };
  }

  puoSalvare = false;
}

function drawPezzoSalvato() {
  if (!pezzoSalvato) return;

  ctx.fillStyle = colors[pezzoSalvato.name];
  drawPezzoMinicicciolo(tetrimini[pezzoSalvato.name], COLS * grid + 20, 300);
}

function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;

    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.75;
    ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.font = '36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
}

function resetGame() {
  score = 0;
  level = 1;
  lines = 0;

  playfield.forEach(row => row.fill(0));

  pezzoSequence.length = 0;
  creaTetrimini();

  tetrimino = avantiUnAltro();

  gameOver = false;
  cancelAnimationFrame(rAF);
  rAF = requestAnimationFrame(loop);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;

  for (let col = 0; col <= COLS; col++) {
    ctx.beginPath();
    ctx.moveTo(col * grid, 0);
    ctx.lineTo(col * grid, ROWS * grid);
    ctx.stroke();
  }

  for (let row = 0; row <= ROWS; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * grid);
    ctx.lineTo(COLS * grid, row * grid);
    ctx.stroke();
  }
}

const canvas = document.getElementById("ilcoso");
const ctx = canvas.getContext("2d");
const grid = 32;
const pezzoSequence = [];

const playfield = [];

const ROWS = 20;
const COLS = 10;

for (let row = 0; row < ROWS; row++) {
    playfield[row] = [];
    for (let col = 0; col < COLS; col++) {
        playfield[row][col] = 0;
    }
}

const tetrimini = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};

const colors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange'
};

let count = 0;
let tetrimino = avantiUnAltro();
let rAF = null;
let gameOver = false;
let toBeDelRow = [];
let animeLinee = false;
let frameAniLinee = 0;
let pezzoSalvato = null;
let puoSalvare = true;
let showCredits = false;
function loop() {
  rAF = requestAnimationFrame(loop);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawGrid();
  drawAnteprima();
  drawPezzoSalvato();

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        ctx.fillStyle = colors[name];
        ctx.fillRect(col * grid, row * grid, grid-1, grid-1);
      }
    }
  }

  if (animeLinee) {
    aniLinee();
    return;
  }

  if (tetrimino) {

    const ghostRow = getGhostPosition();

    const showGhost = ghostRow !== tetrimino.row;

    if (showGhost) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = colors[tetrimino.name];
        ctx.lineWidth = 2;

        for (let row = 0; row < tetrimino.matrix.length; row++) {
            for (let col = 0; col < tetrimino.matrix[row].length; col++) {
                if (tetrimino.matrix[row][col]) {
                    ctx.strokeRect(
                        (tetrimino.col + col) * grid,
                        (ghostRow + row) * grid,
                        grid - 1,
                        grid - 1
                    );
                }
            }
        }

        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors[tetrimino.name];
        ctx.lineWidth = 1;
}

    const speed = Math.max(5, 35 - level * 2);

    if (++count > speed) {
      tetrimino.row++;
      count = 0;

      if (!isValidMove(tetrimino.matrix, tetrimino.row, tetrimino.col)) {
        tetrimino.row--;
        piazzaBlocco();
      }
    }

    ctx.fillStyle = colors[tetrimino.name];

    for (let row = 0; row < tetrimino.matrix.length; row++) {
      for (let col = 0; col < tetrimino.matrix[row].length; col++) {
        if (tetrimino.matrix[row][col]) {
          ctx.fillRect(
            (tetrimino.col + col) * grid,
            (tetrimino.row + row) * grid,
            grid-1,
            grid-1
          );
        }
      }
    }
  }

if (popupTimer > 0) {
  popupTimer--;

  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = "40px monospace";
  ctx.textAlign = "center";
  ctx.globalAlpha = popupTimer / 60;

  ctx.fillText(popupText, canvas.width / 2, canvas.height / 2);

  ctx.restore();
}

if (showCredits) {
  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";

  ctx.fillText("Tetris remake", canvas.width / 2, canvas.height / 2);
  ctx.fillText("da Luigi Cafà e Filippo Vella 3D", canvas.width / 2, canvas.height / 2 + 30);

  ctx.restore();
}

  ctx.fillStyle = "white";
  ctx.font = "16px monospace";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Level: " + level, 10, 40);
}

document.addEventListener('keydown', function(e) {
  if (gameOver) return;

  if (e.which === 37 || e.which === 39) {
    const col = e.which === 37
      ? tetrimino.col - 1
      : tetrimino.col + 1;

    if (isValidMove(tetrimino.matrix, tetrimino.row, col)) {
      tetrimino.col = col;
    }
  }

  if (e.which === 38) {
    const matrix = rotate(tetrimino.matrix);
    if (isValidMove(matrix, tetrimino.row, tetrimino.col)) {
      tetrimino.matrix = matrix;
    }
  }

  if (e.which === 40) {
    const row = tetrimino.row + 1;

    if (!isValidMove(tetrimino.matrix, row, tetrimino.col)) {
      tetrimino.row = row - 1;
      piazzaBlocco();
      return;
    }

    tetrimino.row = row;
  }

  if (e.code === 'Space') {
    e.preventDefault();
    tetrimino.row = getGhostPosition();
    piazzaBlocco();
  }

  if (e.key === 'c' || e.key === 'C') {
    salva();
  }
});

rAF = requestAnimationFrame(loop);
