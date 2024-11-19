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
}

// Vijanden bewegen
function moveEnemies() {
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (enemy.size >= AGGRESSIVE_SIZE) {
            // Agressieve vijanden jagen op Lingling
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
        } else {
            // Niet-agressieve vijanden rennen weg van Lingling
            if (distance > 0) {
                enemy.x -= (dx / distance) * enemy.speed;
                enemy.y -= (dy / distance) * enemy.speed;
            }
        }
        constrainPosition(enemy); // Zorg ervoor dat vijanden binnen het canvas blijven
    });
}

// Beweeg speler
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    // Zorg dat speler binnen canvas blijft
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
                enemy.size += 20; // De vijand die het snoepje eet, wordt groter
                if (enemy.size >= AGGRESSIVE_SIZE) {
                    enemy.aggressive = true; // Vijand wordt agressief
                }
                return false; // Snoepje verdwijnt
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
                alert('Game Over! Je score: ' + score);
                document.location.reload();
            } else {
                score += 100; // Kleine vijanden worden opgegeten
                return false;
            }
        }
        return true;
    });
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
    checkPlayerCollisions();
    requestAnimationFrame(gameLoop);
}

// Start het spel
spawnInitialEntities();
setInterval(spawnEnemy, 3000); // Nieuwe vijanden elke 3 seconden
setInterval(spawnCandy, 5000); // Nieuwe snoepjes elke 5 seconden
gameLoop();
