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
const lumpiaImg = new Image();
lumpiaImg.src = 'lumpia.png';
const drolImg = new Image();
drolImg.src = 'drol.png';

// Speler en vijanden
let player = { x: 400, y: 300, size: 50, speed: 5, dx: 0, dy: 0 };
let enemies = [];
let candies = [];
let lumpias = [];
let drollen = [];
let score = 0;
const AGGRESSIVE_SIZE = 70;
let gameOver = false;

// Helpers
function randomPosition() {
    return {
        x: Math.random() * (canvas.width - 50),
        y: Math.random() * (canvas.height - 50),
    };
}

function constrainPosition(entity) {
    if (entity.x < 0) entity.x = 0;
    if (entity.x + entity.size > canvas.width) entity.x = canvas.width - entity.size;
    if (entity.y < 0) entity.y = 0;
    if (entity.y + entity.size > canvas.height) entity.y = canvas.height - entity.size;
}

// Spawn initiële entiteiten
function spawnInitialEntities() {
    for (let i = 0; i < 3; i++) spawnEnemy();
    for (let i = 0; i < 5; i++) spawnCandy();
    for (let i = 0; i < 3; i++) spawnLumpia();
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

// Lumpia's maken
function spawnLumpia() {
    const lumpia = { ...randomPosition(), size: 30 };
    lumpias.push(lumpia);
}

// Drollen maken
function spawnDrol(x, y) {
    const drol = { x, y, size: 20 };
    drollen.push(drol);
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

    // Teken lumpia's
    lumpias.forEach(lumpia => {
        ctx.drawImage(lumpiaImg, lumpia.x, lumpia.y, lumpia.size, lumpia.size);
    });

    // Teken drollen
    drollen.forEach(drol => {
        ctx.drawImage(drolImg, drol.x, drol.y, drol.size, drol.size);
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
    }
}

// Vijanden bewegen
function moveEnemies() {
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Vijand wordt trager naarmate hij groter wordt
        const speedFactor = Math.max(0.5, 2 - (enemy.size - 50) / 50);
        enemy.speed = speedFactor;

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

// Speler bewegen
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    constrainPosition(player);
}

// Controleer botsingen
function checkCollisions() {
    // Snoepjes
    candies = candies.filter(candy => {
        for (let enemy of enemies) {
            if (candy.x < enemy.x + enemy.size &&
                candy.x + candy.size > enemy.x &&
                candy.y < enemy.y + enemy.size &&
                candy.y + candy.size > enemy.y) {
                enemy.size += 20;
                return false;
            }
        }
        return true;
    });

    // Lumpia's
    lumpias = lumpias.filter(lumpia => {
        for (let enemy of enemies) {
            if (lumpia.x < enemy.x + enemy.size &&
                lumpia.x + lumpia.size > enemy.x &&
                lumpia.y < enemy.y + enemy.size &&
                lumpia.y + lumpia.size > enemy.y) {
                spawnDrol(enemy.x, enemy.y);
                return false;
            }
        }
        return true;
    });

    // Speler botsing met vijanden
    enemies = enemies.filter(enemy => {
        const collided = player.x < enemy.x + enemy.size &&
                         player.x + player.size > enemy.x &&
                         player.y < enemy.y + enemy.size &&
                         player.y + player.size > enemy.y;

        if (collided) {
            if (enemy.size >= AGGRESSIVE_SIZE) {
                gameOver = true;
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

// Game loop
function gameLoop() {
    draw();
    if (!gameOver) {
        movePlayer();
        moveEnemies();
        checkCollisions();
        requestAnimationFrame(gameLoop);
    }
}

// Start spel
spawnInitialEntities();
setInterval(spawnEnemy, 3000);
setInterval(spawnCandy, 5000);
setInterval(spawnLumpia, 7000);
gameLoop();
