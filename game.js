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
const candyImg = new Image();
catImg.src = 'cat.png';
candyImg.src = 'candy.png';

// Speler en vijanden
let player = { x: 400, y: 300, size: 50, speed: 5, dx: 0, dy: 0 };
let enemies = [];
let candies = [];
let score = 0;

// Helpers
function randomPosition() {
    return {
        x: Math.random() * (canvas.width - 50),
        y: Math.random() * (canvas.height - 50),
    };
}

// Vijanden maken
function spawnEnemy() {
    const enemy = { ...randomPosition(), size: 50, type: Math.random() > 0.5 ? 'dog' : 'cat', speed: 2 };
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

// Vijanden bewegen weg van Lingling
function moveEnemies() {
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
    });
}

// Speler bewegen
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    // Zorg dat speler binnen canvas blijft
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.size));
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.size));
}

// Check botsingen
function checkCollisions() {
    // Vijand botsing
    enemies = enemies.filter(enemy => {
        const collided = player.x < enemy.x + enemy.size &&
                         player.x + player.size > enemy.x &&
                         player.y < enemy.y + enemy.size &&
                         player.y + player.size > enemy.y;

        if (collided) {
            if (enemy.size > 70) {
                alert('Game Over! Je score: ' + score);
                document.location.reload();
            } else {
                score += 100;
                return false;
            }
        }
        return true;
    });

    // Snoepjes botsing
    candies = candies.filter(candy => {
        const collided = player.x < candy.x + candy.size &&
                         player.x + player.size > candy.x &&
                         player.y < candy.y + candy.size &&
                         player.y + player.size > candy.y;

        if (collided) {
            enemies.forEach(enemy => (enemy.size += 20)); // Vijanden worden groter
            return false;
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
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

// Start het spel
setInterval(spawnEnemy, 2000);
setInterval(spawnCandy, 5000);
gameLoop();
