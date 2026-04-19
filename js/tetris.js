let score = 0;
let level = 1;
let lines = 0;

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

    const name = pezzoSequence.pop();
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

  let linesCleared = 0;

  for (let row = playfield.length - 1; row >= 0; ) {

    if (playfield[row].every(cell => cell !== 0)) {
      for (let r = row; r > 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c];
        }
      }
      for (let c = 0; c < playfield[0].length; c++) {
        playfield[0][c] = 0;
      }

      linesCleared++;

    } else {
      row--;
    }
  }

  if (linesCleared > 0) {
    const points = [0, 100, 300, 500, 800];
    score += points[linesCleared] * level;
    lines += linesCleared;

    level = Math.floor(lines / 10) + 1;
  }

  tetrimino = avantiUnAltro();
}

function getGhostPosition() {
    let ghostRow = tetrimino.row;

    while (isValidMove(tetrimino.matrix, ghostRow + 1, tetrimino.col)) {
        ghostRow++;
    }

    return ghostRow;
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
function loop() {
  rAF = requestAnimationFrame(loop);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        ctx.fillStyle = colors[name];
        ctx.fillRect(col * grid, row * grid, grid-1, grid-1);
      }
    }
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
});

rAF = requestAnimationFrame(loop);
