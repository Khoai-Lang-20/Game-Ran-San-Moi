const loseMessages = [
  "💥 Thua rồi! Tay nhanh hơn não rồi bạn ơi!",
  "🐔 Gà quá! Đâm ngay vào tường/chướng ngại vật thế kia!",
  "🙈 Thôi xong! Chú rắn đã 'hi sinh' một cách vô cùng lãng xẹt!",
  "📉 Chưa đủ trình rồi! Về luyện thêm phản xạ đi nhé!",
  "🧱 Đâm đầu vào tường đau không bạn ơi?"
];

// Lấy các element DOM sau khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const menuScreen = document.getElementById('menu-screen');
  const gameScreen = document.getElementById('game-screen');
  const startBtn = document.getElementById('start-btn');
  const backMenuBtn = document.getElementById('back-menu-btn');
  const restartBtn = document.getElementById('restart-btn');

  const mapSelect = document.getElementById('map-select');
  const speedSelect = document.getElementById('speed-select');
  const highScoreDisplay = document.getElementById('high-score-display');
  const mapNameDisplay = document.getElementById('map-name-display');

  const scoreDisplay = document.getElementById('score');
  const speedLevelDisplay = document.getElementById('speed-level');
  const messageBox = document.getElementById('message-box');

  const gridSize = 15;
  const tileCount = canvas.width / gridSize;

  let snake = [];
  let food = { x: 0, y: 0 };
  let obstacles = [];
  let dx = 1;
  let dy = 0;
  let score = 0;

  let selectedMap = 'classic';
  let initialSpeed = 120;
  let currentSpeed = 120;
  let isGameOver = false;
  let gameLoopTimeout = null;

  // Tải kỷ lục khi vào trang
  loadHighScore();

  // Sự kiện nút bấm
  startBtn.onclick = startGame;
  backMenuBtn.onclick = backToMenu;
  restartBtn.onclick = startGame;

  document.addEventListener('keydown', changeDirection);

  document.getElementById('btn-up').onclick = () => setDirection(0, -1);
  document.getElementById('btn-down').onclick = () => setDirection(0, 1);
  document.getElementById('btn-left').onclick = () => setDirection(-1, 0);
  document.getElementById('btn-right').onclick = () => setDirection(1, 0);

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

  function startGame() {
    clearTimeout(gameLoopTimeout); // Xóa loop cũ nếu có

    selectedMap = mapSelect.value;
    initialSpeed = parseInt(speedSelect.value);
    currentSpeed = initialSpeed;

    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    isGameOver = false;

    scoreDisplay.textContent = score;
    speedLevelDisplay.textContent = "1.0";
    messageBox.classList.add('hidden');
    restartBtn.classList.add('hidden');

    if (selectedMap === 'classic') {
      mapNameDisplay.textContent = "🧱 Map Cổ Điển";
      obstacles = [];
    } else if (selectedMap === 'borderless') {
      mapNameDisplay.textContent = "🌀 Map Xuyên Tường";
      obstacles = [];
    } else {
      mapNameDisplay.textContent = "🚧 Map Chướng Ngại Vật";
      generateObstacles(8);
    }

    generateFood();

    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    runGame();
  }

  function runGame() {
    if (isGameOver) return;

    clearCanvas();
    drawObstacles();
    drawFood();
    moveSnake();
    drawSnake();
    checkCollision();

    if (!isGameOver) {
      currentSpeed = Math.max(50, initialSpeed - Math.floor(score / 30) * 10);
      let speedMult = (initialSpeed / currentSpeed).toFixed(1);
      speedLevelDisplay.textContent = speedMult;

      gameLoopTimeout = setTimeout(runGame, currentSpeed);
    }
  }

  function clearCanvas() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function generateObstacles(count) {
    obstacles = [];
    while (obstacles.length < count) {
      let obsX = Math.floor(Math.random() * tileCount);
      let obsY = Math.floor(Math.random() * tileCount);

      let onSnake = snake.some(p => p.x === obsX && p.y === obsY);
      let nearStart = obsX >= 5 && obsX <= 15 && obsY === 10;

      if (!onSnake && !nearStart) {
        obstacles.push({ x: obsX, y: obsY });
      }
    }
  }

  function drawObstacles() {
    ctx.fillStyle = '#64748b';
    obstacles.forEach(obs => {
      ctx.fillRect(obs.x * gridSize + 1, obs.y * gridSize + 1, gridSize - 2, gridSize - 2);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(obs.x * gridSize + 1, obs.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
  }

  function drawSnake() {
    snake.forEach((part, index) => {
      const centerX = part.x * gridSize + gridSize / 2;
      const centerY = part.y * gridSize + gridSize / 2;
      const radius = gridSize / 2 - 1;

      if (index === 0) {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        let e1X = centerX, e1Y = centerY, e2X = centerX, e2Y = centerY;
        if (dx === 1) { e1X += 3; e1Y -= 3; e2X += 3; e2Y += 3; }
        else if (dx === -1) { e1X -= 3; e1Y -= 3; e2X -= 3; e2Y += 3; }
        else if (dy === 1) { e1X -= 3; e1Y += 3; e2X += 3; e2Y += 3; }
        else if (dy === -1) { e1X -= 3; e1Y -= 3; e2X += 3; e2Y -= 3; }

        ctx.beginPath();
        ctx.arc(e1X, e1Y, 2, 0, Math.PI * 2);
        ctx.arc(e2X, e2Y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function moveSnake() {
    let headX = snake[0].x + dx;
    let headY = snake[0].y + dy;

    if (selectedMap === 'borderless') {
      if (headX < 0) headX = tileCount - 1;
      if (headX >= tileCount) headX = 0;
      if (headY < 0) headY = tileCount - 1;
      if (headY >= tileCount) headY = 0;
    }

    const head = { x: headX, y: headY };
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

    let onSnake = snake.some(p => p.x === food.x && p.y === food.y);
    let onObs = obstacles.some(o => o.x === food.x && o.y === food.y);

    if (onSnake || onObs) {
      generateFood();
    }
  }

  function drawFood() {
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 1;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(centerX - 1, centerY - radius - 2, 2, 3);
  }

  function checkCollision() {
    const head = snake[0];

    if (selectedMap === 'classic' || selectedMap === 'obstacles') {
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
      }
    }

    if (selectedMap === 'obstacles') {
      for (let obs of obstacles) {
        if (head.x === obs.x && head.y === obs.y) {
          gameOver();
          return;
        }
      }
    }

    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        gameOver();
        return;
      }
    }
  }

  function gameOver() {
    isGameOver = true;
    clearTimeout(gameLoopTimeout);

    saveHighScore(score);

    const randMsg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
    messageBox.textContent = `${randMsg} (Tổng điểm: ${score})`;
    messageBox.classList.remove('hidden');
    restartBtn.classList.remove('hidden');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 20px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
  }

  function backToMenu() {
    isGameOver = true;
    clearTimeout(gameLoopTimeout);
    gameScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    loadHighScore();
  }

  function saveHighScore(currentScore) {
    const best = localStorage.getItem('snakeGame_highScore') || 0;
    if (currentScore > parseInt(best)) {
      localStorage.setItem('snakeGame_highScore', currentScore);
    }
  }

  function loadHighScore() {
    const best = localStorage.getItem('snakeGame_highScore');
    if (best) {
      highScoreDisplay.innerHTML = `🏅 Điểm cao nhất: <strong>${best} điểm</strong>`;
    } else {
      highScoreDisplay.textContent = "Chưa có kỷ lục nào!";
    }
  }
});
