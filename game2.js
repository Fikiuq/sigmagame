const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 50, y: 300, width: 30, height: 30, dy: 0, gravity: 0.5 };
let obstacles = [];
let score = 0;
let gameSpeed = 4;
let gameInterval;
let difficultyIncreaseInterval;

document.addEventListener('keydown', jump);

// Functie om speler te laten springen
function jump(event) {
    if (event.key === ' ' || event.key === 'ArrowUp') {
        player.dy = -10;
    }
}

function updatePlayer() {
    player.y += player.dy;
    player.dy += player.gravity;

    // Zorg dat de speler niet door de grond valt
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
    }
}

function createObstacle() {
    const obstacle = { x: canvas.width, y: 330, width: 20, height: 40 };
    obstacles.push(obstacle);
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;

        // Verwijder obstakels die buiten het scherm zijn
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 10;
        }

        // Controleer op botsingen
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gameOver();
        }
    });
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(difficultyIncreaseInterval);
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').style.display = 'block';
}

function restartGame() {
    player.y = 300;
    obstacles = [];
    score = 0;
    gameSpeed = 4;
    document.getElementById('game-over').style.display = 'none';
    startGame();
}

function backToMenu() {
    window.location.href = 'index.html';
}

// Verhoog de moeilijkheidsgraad na verloop van tijd
function increaseDifficulty() {
    gameSpeed += 0.5;
    if (gameSpeed > 12) gameSpeed = 12; // Limiteer de snelheid
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    updateObstacles();
    
    // Teken de speler
    ctx.fillStyle = '#f9d342';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Teken de obstakels
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#d94f5c';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Scoreweergave
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, 10, 30);

    if (Math.random() < 0.02) {
        createObstacle();
    }
}

// Start de game en verhoog de moeilijkheidsgraad om de paar seconden
function startGame() {
    gameInterval = setInterval(gameLoop, 1000 / 60);
    difficultyIncreaseInterval = setInterval(increaseDifficulty, 3000); // Moeilijker elke 3 seconden
}

startGame();
