const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game assets
const playerImg = new Image();
playerImg.src = 'lingling.png';

const botImgs = ['cat.png', 'dog.png'];
const candyImg = new Image();
candyImg.src = 'candy.png';

let player = { x: 400, y: 300, width: 50, height: 50, speed: 5 };
let bots = [];
let candies = [];
let obstacles = [];
let score = 0;
let gameOver = false;

const keys = {};
let gameStarted = false;

// Movement keys
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

// Start Game
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    initializeGame();
    update();
});

// Generate obstacles
function generateObstacles(num) {
    for (let i = 0; i < num; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - 50),
            y: Math.random() * (canvas.height - 50),
            width: 50,
            height: 50,
        });
    }
}

// Spawn candies
function spawnCandy() {
    if (candies.length < 4) {
        candies.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 30),
            width: 30,
            height: 30,
        });
    }
}

// Spawn bots
function spawnBot() {
    if (bots.length < 10) {
        const botImg = new Image();
        botImg.src = botImgs[Math.floor(Math.random() * botImgs.length)];

        bots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            width: 50,
            height: 50,
            speed: Math.random() * 2 + 1,
            img: botImg,
            isAggressive: false,
            growTime: null,
        });
    }
}

// Movement logic
function movePlayer() {
    const newX = keys['ArrowLeft'] ? player.x - player.speed : keys['ArrowRight'] ? player.x + player.speed : player.x;
    const newY = keys['ArrowUp'] ? player.y - player.speed : keys['ArrowDown'] ? player.y + player.speed : player.y;

    if (!collidesWithObstacle(newX, player.y)) player.x = Math.max(0, Math.min(newX, canvas.width - player.width));
    if (!collidesWithObstacle(player.x, newY)) player.y = Math.max(0, Math.min(newY, canvas.height - player.height));
}

function moveBots() {
    bots.forEach((bot) => {
        if (bot.isAggressive) {
            bot.x += bot.x < player.x ? bot.speed : -bot.speed;
            bot.y += bot.y < player.y ? bot.speed : -bot.speed;
        } else {
            bot.x += bot.x > player.x ? bot.speed : -bot.speed;
            bot.y += bot.y > player.y ? bot.speed : -bot.speed;
        }

        bot.x = Math.max(0, Math.min(bot.x, canvas.width - bot.width));
        bot.y = Math.max(0, Math.min(bot.y, canvas.height - bot.height));
    });
}

// Check collisions
function collidesWithObstacle(x, y) {
    return obstacles.some(
        (obs) =>
            x < obs.x + obs.width &&
            x + player.width > obs.x &&
            y < obs.y + obs.height &&
            y + player.height > obs.y
    );
}

// Collision logic
function checkCollisions() {
    bots.forEach((bot, i) => {
        if (
            player.x < bot.x + bot.width &&
            player.x + player.width > bot.x &&
            player.y < bot.y + bot.height &&
            player.y + player.height > bot.y
        ) {
            if (!bot.isAggressive) {
                bots.splice(i, 1);
                score += 100;
            } else {
                gameOver = true;
            }
        }
    });

    candies.forEach((candy, i) => {
        if (
            player.x < candy.x + candy.width &&
            player.x + player.width > candy.x &&
            player.y < candy.y + candy.height &&
            player.y + player.height > candy.y
        ) {
            candies.splice(i, 1);
            spawnCandy();
        }
    });
}

// Game initialization
function initializeGame() {
    generateObstacles(5);
    setInterval(spawnCandy, 10000);
    setInterval(spawnBot, 5000);
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    obstacles.forEach((obs) => {
        ctx.fillStyle = 'brown';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    bots.forEach((bot) => ctx.drawImage(bot.img, bot.x, bot.y, bot.width, bot.height));
    candies.forEach((candy) => ctx.drawImage(candyImg, candy.x, candy.y, candy.width, candy.height));

    ctx.fillStyle = 'gold';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2);
    }
}

// Update loop
function update() {
    if (gameOver || !gameStarted) return;

    movePlayer();
    moveBots();
    checkCollisions();
    draw();

    requestAnimationFrame(update);
}
