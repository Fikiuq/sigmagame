const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Images for background
const bgImage = new Image();
bgImage.src = 'b.png'; // Moving background image

// Player and Game Variables
let player = { x: 50, y: 300, width: 30, height: 30, dy: 0, gravity: 0.5, onGround: false };
let obstacles = [];
let score = 0;
let gameSpeed = 4;
let gameInterval;
let difficultyIncreaseInterval;

// Background Scrolling
let backgroundX = 0;

document.addEventListener('keydown', jump);

// Jump function - only jumps if player is on the ground
function jump(event) {
    if ((event.key === ' ' || event.key === 'ArrowUp') && player.onGround) {
        player.dy = -10;
        player.onGround = false; // Disables double jump
    }
}

function updatePlayer() {
    player.y += player.dy;
    player.dy += player.gravity;

    // Prevent player from falling through the ground
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.onGround = true; // Allow jump again
    }
}

function createObstacle() {
    const obstacle = { x: canvas.width, y: 330, width: 20, height: 40 };
    obstacles.push(obstacle);
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;

        // Remove obstacles that are off screen
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 10;
        }

        // Collision Detection
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameOver();
        }
    });
}

// Function to end the game
function gameOver() {
    clearInterval(gameInterval);
    clearInterval(difficultyIncreaseInterval);
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').style.display = 'block';
}

// Function to restart the game
function restartGame() {
    player.y = 300;
    player.dy = 0;
    obstacles = [];
    score = 0;
    gameSpeed = 4;
    document.getElementById('game-over').style.display = 'none';
    startGame();
}

function backToMenu() {
    window.location.href = 'index.html';
}

// Increase game difficulty over time
function increaseDifficulty() {
    gameSpeed += 0.5;
    if (gameSpeed > 12) gameSpeed = 12; // Limit game speed
}

// Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw moving background
    backgroundX -= gameSpeed / 2;
    if (backgroundX <= -canvas.width) {
        backgroundX = 0;
    }
    ctx.drawImage(bgImage, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    // Update and draw player
    updatePlayer();
    ctx.fillStyle = '#f9d342';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Update and draw obstacles
    updateObstacles();
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#d94f5c';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Display score
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Randomly create new obstacles
    if (Math.random() < 0.02) {
        createObstacle();
    }
}

// Start the game and periodically increase difficulty
function startGame() {
    gameInterval = setInterval(gameLoop, 1000 / 60);
    difficultyIncreaseInterval = setInterval(increaseDifficulty, 3000); // Increase difficulty every 3 seconds
}

startGame();
