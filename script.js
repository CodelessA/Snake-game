//HTML Elements
const board = document.getElementById("game-board");
const instructionText = document.getElementById("instruction");
const logo = document.getElementById("logo");
const score = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const gameTimeElement = document.getElementById("game-time");
const gameSpeedElement = document.getElementById("game-speed");
const gameOverElement = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const newHighScoreElement = document.getElementById("new-high-score");
const playAgainButton = document.getElementById("play-again");
const scoresListElement = document.getElementById("scores-list");

//Game variables
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let highScore = 0;
let direction = "right";
let gameInterval;
let gameSpeedDelay = 200;
let gameStarted = false;
let gamePaused = false;
let gameStartTime = 0;
let timeInterval;
let leaderboard = [];

// Initialize game
initGame();

//Draw map, snake, food
function draw() {
  board.innerHTML = "";
  drawSnake();
  drawFood();
  updateScore();
}

//Draw Snake function
function drawSnake() {
  snake.forEach((segment) => {
    const snakeElement = createGameElement("div", "snake");
    setPosition(snakeElement, segment);
    board.appendChild(snakeElement);
  });
}

//Creating game element function
function createGameElement(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

//Set snake and food position
function setPosition(element, position) {
  element.style.gridColumn = position.x;
  element.style.gridRow = position.y;
}

/*--------Food factory start--------*/
function drawFood() {
  if (gameStarted) {
    const foodElement = createGameElement("div", "food");
    setPosition(foodElement, food);
    board.appendChild(foodElement);
  }
}

function generateFood() {
  const x = Math.floor(Math.random() * gridSize) + 1;
  const y = Math.floor(Math.random() * gridSize) + 1;
  return { x, y };
}
/*--------Food factory end--------*/

/*--------Snake movement start--------*/
function move() {
  const head = { ...snake[0] };
  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;

    default:
      break;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = generateFood();
    increaseSpeed();
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      move();
      checkCollision();
      draw();
    }, gameSpeedDelay);
  } else {
    snake.pop();
  }
}
/*--------Snake movement end--------*/

/*--------Game start function--------*/
function startGame() {
  gameStarted = true;
  instructionText.style.display = "none";
  logo.style.display = "none";
  gameInterval = setInterval(() => {
    move();
    checkCollision();
    draw();
  }, gameSpeedDelay);
}
/*--------Game start end--------*/

//Key event listener
function handleKeyPress(event) {
  if (
    (!gameStarted && event.code === "space") ||
    (!gameStarted && event.key === " ")
  ) {
    startGame();
  } else if (gameStarted) {
    switch (event.key) {
      case "ArrowUp":
        if (direction !== "down") direction = "up";
        break;
      case "ArrowDown":
        if (direction !== "up") direction = "down";
        break;
      case "ArrowLeft":
        if (direction !== "right") direction = "left";
        break;
      case "ArrowRight":
        if (direction !== "left") direction = "right";
        break;
      case "p":
      case "P":
        pauseGame();
        break;
      case "r":
      case "R":
        if (gameStarted) {
          restartGame();
        }
        break;
    }
  }
}

document.addEventListener("keydown", handleKeyPress);

function increaseSpeed() {
  if (gameSpeedDelay > 150) {
    gameSpeedDelay -= 5;
  } else if (gameSpeedDelay > 100) {
    gameSpeedDelay -= 3;
  } else if (gameSpeedDelay > 50) {
    gameSpeedDelay -= 2;
  } else if (gameSpeedDelay > 25) {
    gameSpeedDelay -= 1;
  }
  updateGameSpeed();
}

function checkCollision() {
  const head = snake[0];

  if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
    showGameOver();
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      showGameOver();
    }
  }
}

function resetGame() {
  updateHighScore();
  stopGame();
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = "right";
  gameSpeedDelay = 200;
  gamePaused = false;
  updateScore();
  updateGameSpeed();
  gameTimeElement.textContent = "00:00";
}

function updateScore() {
  const currentScore = snake.length - 1;
  score.textContent = currentScore.toString().padStart(3, "0");
}

function stopGame() {
  clearInterval(gameInterval);
  clearInterval(timeInterval);
  gameStarted = false;
  gamePaused = false;
  instructionText.style.display = "block";
  logo.style.display = "block";
}

function updateHighScore() {
  const currentScore = snake.length - 1;

  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreText.textContent = highScore.toString().padStart(3, "0");
    saveHighScore();
  }
  highScoreText.style.display = "block";
}

// New functions for enhanced gameplay
function initGame() {
  loadHighScore();
  loadLeaderboard();
  updateLeaderboard();
  playAgainButton.addEventListener('click', restartGame);
}

function startGame() {
  gameStarted = true;
  gamePaused = false;
  gameStartTime = Date.now();
  instructionText.style.display = "none";
  logo.style.display = "none";
  gameOverElement.classList.add('hidden');
  
  // Start time counter
  timeInterval = setInterval(updateGameTime, 1000);
  
  gameInterval = setInterval(() => {
    if (!gamePaused) {
      move();
      checkCollision();
      draw();
    }
  }, gameSpeedDelay);
}

function pauseGame() {
  if (gameStarted && !gamePaused) {
    gamePaused = true;
    instructionText.textContent = "PAUSED - Press P to resume";
    instructionText.style.display = "block";
  } else if (gameStarted && gamePaused) {
    gamePaused = false;
    instructionText.style.display = "none";
  }
}

function restartGame() {
  stopGame();
  resetGame();
  gameOverElement.classList.add('hidden');
  startGame();
}

function updateGameTime() {
  if (gameStarted && !gamePaused) {
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    gameTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

function updateGameSpeed() {
  const baseSpeed = 200;
  const currentSpeed = Math.round((baseSpeed / gameSpeedDelay) * 10) / 10;
  gameSpeedElement.textContent = `${currentSpeed}x`;
}

function showGameOver() {
  // Stop the game immediately
  clearInterval(gameInterval);
  clearInterval(timeInterval);
  gameStarted = false;
  gamePaused = false;
  
  const currentScore = snake.length - 1;
  finalScoreElement.textContent = `Final Score: ${currentScore.toString().padStart(3, "0")}`;
  
  // Check for new high score
  if (currentScore > highScore) {
    newHighScoreElement.classList.remove('hidden');
    addToLeaderboard(currentScore);
  } else {
    newHighScoreElement.classList.add('hidden');
  }
  
  gameOverElement.classList.remove('hidden');
}

function addToLeaderboard(score) {
  const timestamp = new Date().toLocaleDateString();
  leaderboard.push({ score, timestamp });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10); // Keep top 10
  saveLeaderboard();
  updateLeaderboard();
}

function updateLeaderboard() {
  scoresListElement.innerHTML = '';
  leaderboard.forEach((entry, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${index + 1}. ${entry.score.toString().padStart(3, "0")}</span>
      <span>${entry.timestamp}</span>
    `;
    scoresListElement.appendChild(li);
  });
}

function saveHighScore() {
  localStorage.setItem('snakeHighScore', highScore.toString());
}

function loadHighScore() {
  const saved = localStorage.getItem('snakeHighScore');
  if (saved) {
    highScore = parseInt(saved);
    highScoreText.textContent = highScore.toString().padStart(3, "0");
    highScoreText.style.display = "block";
  }
}

function saveLeaderboard() {
  localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
}

function loadLeaderboard() {
  const saved = localStorage.getItem('snakeLeaderboard');
  if (saved) {
    leaderboard = JSON.parse(saved);
  }
}

// Enhanced food generation to avoid snake collision
function generateFood() {
  let newFood;
  do {
    const x = Math.floor(Math.random() * gridSize) + 1;
    const y = Math.floor(Math.random() * gridSize) + 1;
    newFood = { x, y };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}
