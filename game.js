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
let isGameOver = false;
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
    for (let i = 0; i < 2; i++) {
        spawnLumpia();
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

// Lumpia maken
function spawnLumpia() {
    const lumpia = { ...randomPosition(), size: 20 };
    lumpias.push(lumpia);
}

// Drol maken
function spawnDrol(position) {
    const drol = { ...position, size: 20 };
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

        // Verlaag snelheid als vijand groter wordt
        enemy.speed = 2 - (enemy.size - 50) / 100;

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

// Botsingen tussen vijanden en lumpia's
function checkLumpiaCollisions() {
    lumpias = lumpias.filter(lumpia => {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const collided = lumpia.x < enemy.x + enemy.size &&
                             lumpia.x + lumpia.size > enemy.x &&
                             lumpia.y < enemy.y + enemy.size &&
                             lumpia.y + lumpia.size > enemy.y;

            if (collided) {
                spawnDrol({ x: enemy.x, y: enemy.y }); // Laat een drol achter
                return false; // Lumpia verdwijnt
            }
        }
        return true;
    });
}

// Check botsingen tussen speler en vijanden
function checkPlayerCollisions() {
    enemies.forEach(enemy => {
        const collided = player.x < enemy.x + enemy.size &&
                         player.x + player.size > enemy.x &&
                         player.y < enemy.y + enemy.size &&
                         player.y + player.size > enemy.y;

        if (collided) {
            if (enemy.size >= AGGRESSIVE_SIZE) {
                endGame();
            } else {
                score += 100; // Kleine vijanden worden opgegeten
                enemies.splice(enemies.indexOf(enemy), 1); // Vijand verdwijnt
            }
        }
    });
}

// Eindig spel
function endGame() {
    isGameOver = true;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Klik om opnieuw te spelen', canvas.width / 2, canvas.height / 2 + 60);

    canvas.addEventListener('click', () => {
        document.location.reload();
    });
}

// Toetsenbord events
let keys = {};
document.addEventListener('keydown', e => {
    keys[e.key] = true;
});

document.addEventListener('keyup', e => {
    keys[e.key] = false;
});

function handlePlayerMovement() {
    player.dx = 0;
    player.dy = 0;

    if (keys['ArrowUp']) player.dy = -player.speed;
    if (keys['ArrowDown']) player.dy = player.speed;
    if (keys['ArrowLeft']) player.dx = -player.speed;
    if (keys['ArrowRight']) player.dx = player.speed;

    movePlayer();
}

// Game loop
function gameLoop() {
    if (!isGameOver) {
        draw();
        handlePlayerMovement();
        moveEnemies();
        checkCandyCollisions();
        checkLumpiaCollisions();
        checkPlayerCollisions();
        requestAnimationFrame(gameLoop);
    }
}

// Start het spel
spawnInitialEntities();
setInterval(spawnEnemy, 3000); // Nieuwe vijanden elke 3 seconden
setInterval(spawnCandy, 5000); // Nieuwe snoepjes elke 5 seconden
setInterval(spawnLumpia, 7000); // Nieuwe lumpia's elke 7 seconden
gameLoop();
