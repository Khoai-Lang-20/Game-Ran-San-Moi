const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

// Cấu hình ô lưới bàn cờ
const gridSize = 15; // Kích thước mỗi ô (15px)
const tileCount = canvas.width / gridSize; // 300 / 15 = 20 ô

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1; // Hướng di chuyển X (1: phải, -1: trái)
let dy = 0; // Hướng di chuyển Y (1: xuống, -1: lên)
let score = 0;
let gameInterval = null;
let isGameOver = false;

// Bắt sự kiện phím mũi tên trên máy tính
document.addEventListener('keydown', changeDirection);

// Bắt sự kiện nút bấm điều khiển trên di động
document.getElementById('btn-up').addEventListener('click', () => setDirection(0, -1));
document.getElementById('btn-down').addEventListener('click', () => setDirection(0, 1));
document.getElementById('btn-left').addEventListener('click', () => setDirection(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => setDirection(1, 0));

restartBtn.addEventListener('click', resetGame);

function setDirection(newDx, newDy) {
  // Tránh việc di chuyển ngược chiều trực tiếp (ví dụ đang sang phải không thể rẽ trái ngay)
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

function main() {
  if (isGameOver) return;

  setTimeout(function() {
    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
    checkCollision();
    main();
  }, 120); // Tốc độ di chuyển (120ms/bước)
}

function clearCanvas() {
  ctx.fillStyle = '#1b2838';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  snake.forEach((part, index) => {
    // Đầu rắn màu xanh chuối sáng, thân màu xanh lá
    ctx.fillStyle = index === 0 ? '#7ee787' : '#2ea043';
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
  });
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  // Rắn ăn mồi
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreDisplay.textContent = score;
    generateFood();
  } else {
    snake.pop(); // Bỏ phần đuôi nếu không ăn mồi
  }
}

function generateFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);

  // Đảm bảo mồi không xuất hiện trên thân rắn
  snake.forEach(part => {
    if (part.x === food.x && part.y === food.y) {
      generateFood();
    }
  });
}

function drawFood() {
  ctx.fillStyle = '#ff7b72'; // Mồi màu đỏ
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
}

function checkCollision() {
  const head = snake[0];

  // Va chạm tường
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
  }

  // Va chạm với chính thân rắn
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
    }
  }
}

function gameOver() {
  isGameOver = true;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ff7b72';
  ctx.font = 'bold 20px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Segoe UI';
  ctx.fillText(`Điểm đạt được: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 1;
  dy = 0;
  score = 0;
  scoreDisplay.textContent = score;
  isGameOver = false;
  generateFood();
  main();
}

// Bắt đầu game ván đầu tiên
generateFood();
main();
