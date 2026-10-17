const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const speedLevelDisplay = document.getElementById('speed-level');
const restartBtn = document.getElementById('restart-btn');

const gridSize = 15;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let score = 0;
let gameSpeed = 120; // Tốc độ ban đầu (ms)
let isGameOver = false;

document.addEventListener('keydown', changeDirection);

document.getElementById('btn-up').addEventListener('click', () => setDirection(0, -1));
document.getElementById('btn-down').addEventListener('click', () => setDirection(0, 1));
document.getElementById('btn-left').addEventListener('click', () => setDirection(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => setDirection(1, 0));

restartBtn.addEventListener('click', resetGame);

function setDirection(newDx, newDy) {
  if (isGameOver) return;
  if (newDx === -dx && newDx !== 0) return;
  if (newDy === -dy && newDy !== 0) return;
  dx = newDx;
  dy = newDy;
}

function changeDirection(event) {
  const keyPressed = event.keyCode;
  const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

  if (keyPressed === LEFT) setDirection(-1, 0);
  if (keyPressed === UP) setDirection(0, -1);
  if (keyPressed === RIGHT) setDirection(1, 0);
  if (keyPressed === DOWN) setDirection(0, 1);
}

function mainLoop() {
  if (isGameOver) return;

  clearCanvas();
  drawFood();
  moveSnake();
  drawSnake();
  checkCollision();

  if (!isGameOver) {
    // Tự động tăng tốc độ khi điểm cao hơn (mỗi 30 điểm tăng tốc 1 chút, tốc độ tối đa giới hạn 60ms)
    gameSpeed = Math.max(60, 120 - Math.floor(score / 30) * 10);
    let speedLevel = (120 / gameSpeed).toFixed(1);
    speedLevelDisplay.textContent = speedLevel;

    setTimeout(mainLoop, gameSpeed);
  }
}

function clearCanvas() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  snake.forEach((part, index) => {
    const centerX = part.x * gridSize + gridSize / 2;
    const centerY = part.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 1;

    if (index === 0) {
      // Vẽ Đầu rắn hình tròn có mắt sinh động
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Vẽ mắt rắn dựa theo hướng di chuyển
      ctx.fillStyle = '#0f172a';
      let eye1X = centerX, eye1Y = centerY, eye2X = centerX, eye2Y = centerY;
      
      if (dx === 1) { eye1X += 3; eye1Y -= 3; eye2X += 3; eye2Y += 3; }
      else if (dx === -1) { eye1X -= 3; eye1Y -= 3; eye2X -= 3; eye2Y += 3; }
      else if (dy === 1) { eye1X -= 3; eye1Y += 3; eye2X += 3; eye2Y += 3; }
      else if (dy === -1) { eye1X -= 3; eye1Y -= 3; eye2X += 3; eye2Y -= 3; }

      ctx.beginPath();
      ctx.arc(eye1X, eye1Y, 2, 0, Math.PI * 2);
      ctx.arc(eye2X, eye2Y, 2, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Thân rắn hình tròn mềm mại
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreDisplay.textContent = score;
    generateFood();
  } else {
    snake.pop();
  }
}

function generateFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);

  snake.forEach(part => {
    if (part.x === food.x && part.y === food.y) {
      generateFood();
    }
  });
}

function drawFood() {
  // Vẽ đồ ăn hình quả táo đỏ có cuống lá xanh
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;
  const radius = gridSize / 2 - 1;

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Cuống lá nhỏ
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(centerX - 1, centerY - radius - 2, 2, 3);
}

function checkCollision() {
  const head = snake[0];

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
    }
  }
}

function gameOver() {
  isGameOver = true;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 20px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Segoe UI';
  ctx.fillText(`Tổng điểm: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
}

function resetGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dx = 1;
  dy = 0;
  score = 0;
  gameSpeed = 120;
  scoreDisplay.textContent = score;
  speedLevelDisplay.textContent = "1.0";
  isGameOver = false;
  generateFood();
  mainLoop();
}

generateFood();
mainLoop();
