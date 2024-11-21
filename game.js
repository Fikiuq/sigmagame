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
const poopImg = new Image();
poopImg.src = 'poop.png';

// Speler, vijanden, en objecten
let player = { x: 400, y: 300, size: 50, speed: 5, dx: 0, dy: 0 };
let enemies = [];
let candies = [];
let lumpias = [];
let poops = [];
let score = 0;
const AGGRESSIVE_SIZE = 70;

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

// Spawn-functies
function spawnEnemy() {
    const enemy = { ...randomPosition(), size: 50, type: Math.random() > 0.5 ? 'dog' : 'cat', speed: 2, aggressive: false };
    enemies.push(enemy);
}

function spawnCandy() {
    const candy = { ...randomPosition(), size: 20 };
    candies.push(candy);
}

function spawnLumpia() {
    const lumpia = { ...randomPosition(), size: 25 };
    lumpias.push(lumpia);
}

function spawnInitialEntities() {
    for (let i = 0; i < 3; i++) spawnEnemy();
    for (let i = 0; i < 5; i++) spawnCandy();
    for (let i = 0; i < 3; i++) spawnLumpia();
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
    candies.forEach(candy => ctx.drawImage(candyImg, candy.x, candy.y, candy.size, candy.size));

    // Teken lompia's
    lumpias.forEach(lumpia => ctx.drawImage(lumpiaImg, lumpia.x, lumpia.y, lumpia.size, lumpia.size));

    // Teken drollen
    poops.forEach(poop => ctx.drawImage(poopImg, poop.x, poop.y, poop.size, poop.size));

    // Score
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

// Vijanden bewegen
function moveEnemies() {
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const speedModifier = Math.max(0.5, 3 - enemy.size / 50); // Hoe groter de vijand, hoe trager
        const speed = enemy.speed * speedModifier;

        if (enemy.size >= AGGRESSIVE_SIZE) {
            if (distance > 0) {
                enemy.x += (dx / distance) * speed;
                enemy.y += (dy / distance) * speed;
            }
        } else {
            if (distance > 0) {
                enemy.x -= (dx / distance) * speed;
                enemy.y -= (dy / distance) * speed;
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

// Botsingen
function checkCandyCollisions() {
    candies = candies.filter(candy => {
        for (let enemy of enemies) {
            if (checkCollision(candy, enemy)) {
                enemy.size += 20;
                if (enemy.size >= AGGRESSIVE_SIZE) enemy.aggressive = true;
                return false;
            }
        }
        return true;
    });
}

function checkLumpiaCollisions() {
    lumpias = lumpias.filter(lumpia => {
        for (let enemy of enemies) {
            if (checkCollision(lumpia, enemy)) {
                poops.push({ ...enemy, size: 15 }); // Laat een drol achter
                return false;
            }
        }
        return true;
    });
}

function checkPlayerCollisions() {
    enemies = enemies.filter(enemy => {
        if (checkCollision(player, enemy)) {
            if (enemy.size >= AGGRESSIVE_SIZE) {
                showGameOverScreen();
                return false;
            } else {
                score += 100;
                return false;
            }
        }
        return true;
    });
}

function checkCollision(a, b) {
    return a.x < b.x + b.size && a.x + a.size > b.x && a.y < b.y + b.size && a.y + a.size > b.y;
}

// Game over scherm
function showGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
    cancelAnimationFrame(gameLoop); // Stop de animatie
}

// Toetsenbord events
document.addEventListener('keydown', e => {
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
    movePlayer();
    moveEnemies();
    checkCandyCollisions();
    checkLumpiaCollisions();
    checkPlayerCollisions();
    requestAnimationFrame(gameLoop);
}

// Start het spel
spawnInitialEntities();
setInterval(spawnEnemy, 3000);
setInterval(spawnCandy, 5000);
setInterval(spawnLumpia, 7000);
gameLoop();
