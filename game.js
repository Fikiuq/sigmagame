// Canvas instellingen
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Afbeeldingen
const linglingImg = new Image();
linglingImg.src = 'lingling.png';
const dogImg = new Image();
dogImg.src = 'dog.png';
const catImg = new Image();
catImg.src = 'cat.png';
const candyImg = new Image();
candyImg.src = 'candy.png';

// Speler en vijanden
let player = { x: 400, y: 300, size: 50, speed: 5, dx: 0, dy: 0 };
let enemies = [];
let candies = [];
let score = 0;
const AGGRESSIVE_SIZE = 70; // Drempelgrootte voor agressie
let gameOver = false; // Variabele om spelstatus bij te houden

// Helpers
function randomPosition() {
    return {
        x: Math.random() * (canvas.width - 50),
        y: Math.random() * (canvas.height - 50),
    };
}

// Zorg ervoor dat de speler en vijanden binnen het canvas blijven
function constrainPosition(entity) {
    if (entity.x < 0) entity.x = 0;
    if (entity.x + entity.size > canvas.width) entity.x = canvas.width - entity.size;
    if (entity.y < 0) entity.y = 0;
    if (entity.y + entity.size > canvas.height) entity.y = canvas.height - entity.size;
}

// Spawn 3 vijanden en 5 snoepjes in het begin
function spawnInitialEntities() {
    for (let i = 0; i < 3; i++) {
        spawnEnemy();
    }
    for (let i = 0; i < 5; i++) {
        spawnCandy();
    }
}

// Vijanden maken
function spawnEnemy() {
    const enemy = { ...randomPosition(), size: 50, type: Math.random() > 0.5 ? 'dog' : 'cat', speed: 2, aggressive: false };
    enemies.push(enemy);
}

// Snoepjes maken
function spawnCandy() {
    const candy = { ...randomPosition(), size: 20 };
    candies.push(candy);
}

// Teken alles
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Teken speler
    ctx.drawImage(linglingImg, player.x, player.y, player.size, player.size);

    // Teken vijanden
    enemies.forEach(enemy => {
        const img = enemy.type === 'dog' ? dogImg : catImg;
        ctx.drawImage(img, enemy.x, enemy.y, enemy.size, enemy.size);
    });

    // Teken snoepjes
    candies.forEach(candy => {
        ctx.drawImage(candyImg, candy.x, candy.y, candy.size, candy.size);
    });

    // Score
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);

    // Game over scherm
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 80, canvas.height / 2 - 10);
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 30);

        // Play Again knop
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 50, 150, 40);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('Play Again', canvas.width / 2 - 50, canvas.height / 2 + 80);
    }
}

// Vijanden bewegen
function moveEnemies() {
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (enemy.size >= AGGRESSIVE_SIZE) {
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
        } else {
            if (distance > 0) {
                enemy.x -= (dx / distance) * enemy.speed;
                enemy.y -= (dy / distance) * enemy.speed;
            }
        }
        constrainPosition(enemy);
    });
}

// Beweeg speler
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    constrainPosition(player);
}

// Botsingen tussen vijanden en snoepjes
function checkCandyCollisions() {
    candies = candies.filter(candy => {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const collided = candy.x < enemy.x + enemy.size &&
                             candy.x + candy.size > enemy.x &&
                             candy.y < enemy.y + enemy.size &&
                             candy.y + candy.size > enemy.y;

            if (collided) {
                enemy.size += 20;
                if (enemy.size >= AGGRESSIVE_SIZE) {
                    enemy.aggressive = true;
                }
                return false;
            }
        }
        return true;
    });
}

// Check botsingen tussen speler en vijanden
function checkPlayerCollisions() {
    enemies = enemies.filter(enemy => {
        const collided = player.x < enemy.x + enemy.size &&
                         player.x + player.size > enemy.x &&
                         player.y < enemy.y + enemy.size &&
                         player.y + player.size > enemy.y;

        if (collided) {
            if (enemy.size >= AGGRESSIVE_SIZE) {
                gameOver = true; // Zet game over status
                return false;
            } else {
                score += 100;
                return false;
            }
        }
        return true;
    });
}

// Toetsenbord events
document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'ArrowUp') player.dy = -player.speed;
    if (e.key === 'ArrowDown') player.dy = player.speed;
    if (e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === 'ArrowRight') player.dx = player.speed;
});

document.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

// Klik op Play Again knop
canvas.addEventListener('click', e => {
    if (!gameOver) return;

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    if (mouseX > canvas.width / 2 - 75 && mouseX < canvas.width / 2 + 75 &&
        mouseY > canvas.height / 2 + 50 && mouseY < canvas.height / 2 + 90) {
        resetGame();
    }
});

// Reset game
function resetGame() {
    player = { x: 400, y: 300, size: 50, speed: 5, dx: 0, dy: 0 };
    enemies = [];
    candies = [];
    score = 0;
    gameOver = false;
    spawnInitialEntities();
    gameLoop();
}

// Game loop
function gameLoop() {
    draw();
    if (!gameOver) {
        movePlayer();
        moveEnemies();
        checkCandyCollisions();
        checkPlayerCollisions();
        requestAnimationFrame(gameLoop);
    }
}

// Start het spel
spawnInitialEntities();
setInterval(spawnEnemy, 3000);
setInterval(spawnCandy, 5000);
gameLoop();
