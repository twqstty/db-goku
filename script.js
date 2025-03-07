const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const shootSound = document.getElementById("shootSound");
const hitSound = document.getElementById("hitSound");

let score = 0;
const scoreDisplay = document.getElementById("score");

// Загружаем изображение Гоку на Нимбусе
const playerImage = new Image();
playerImage.src = 'https://i.imgur.com/5zX8K9G.png'; // Здесь вставь свою фотку

// Игрок (Гоку на Нимбусе)
const player = {
    x: 50,
    y: canvas.height / 2 - 20,
    width: 60,
    height: 40,
    speed: 5
};

// Управление
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
};

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") keys.up = true;
    if (e.key === "ArrowDown") keys.down = true;
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === " ") keys.space = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") keys.up = false;
    if (e.key === "ArrowDown") keys.down = false;
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === " ") keys.space = false;
});

// Снаряды (Ki Blasts)
let blasts = [];

// Враги (солдаты Фризы)
let enemies = [];
function spawnEnemy() {
    enemies.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 30),
        width: 30,
        height: 30,
        speed: 3
    });
}

// Игровой цикл
let lastSpawnTime = 0;
function update(timestamp) {
    // Движение игрока
    if (keys.up && player.y > 0) player.y -= player.speed;
    if (keys.down && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys.left && player.x > 0) player.x -= player.speed;
    if (keys.right && player.x < canvas.width - player.width) player.x += player.speed;

    // Стрельба
    if (keys.space && blasts.length < 10) {
        blasts.push({
            x: player.x + player.width,
            y: player.y + player.height / 2 - 5,
            width: 20,
            height: 10,
            speed: 7
        });
        shootSound.currentTime = 0;
        shootSound.play();
        keys.space = false;
    }

    // Обновление снарядов
    blasts = blasts.filter(blast => blast.x < canvas.width);
    blasts.forEach(blast => blast.x += blast.speed);

    // Спавн врагов
    if (timestamp - lastSpawnTime > 2000) {
        spawnEnemy();
        lastSpawnTime = timestamp;
    }

    // Обновление врагов и столкновение с игроком
    enemies = enemies.filter(enemy => enemy.x > -enemy.width);
    enemies.forEach((enemy, index) => {
        enemy.x -= enemy.speed;

        // Столкновение с игроком
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            enemies.splice(index, 1);
            score += 10;
            scoreDisplay.textContent = score;
            hitSound.currentTime = 0;
            hitSound.play();
        }

        // Столкновение со снарядами
        blasts.forEach((blast, blastIndex) => {
            if (
                blast.x < enemy.x + enemy.width &&
                blast.x + blast.width > enemy.x &&
                blast.y < enemy.y + enemy.height &&
                blast.y + blast.height > enemy.y
            ) {
                enemies.splice(index, 1);
                blasts.splice(blastIndex, 1);
                score += 10;
                scoreDisplay.textContent = score;
                hitSound.currentTime = 0;
                hitSound.play();
            }
        });
    });

    // Отрисовка
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Игрок (Гоку)
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // Снаряды
    ctx.fillStyle = "#ffd700";
    blasts.forEach(blast => ctx.fillRect(blast.x, blast.y, blast.width, blast.height));

    // Враги
    ctx.fillStyle = "#ff00ff";
    enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height));

    requestAnimationFrame(update);
}

// Ждём загрузки изображения перед стартом
playerImage.onload = () => requestAnimationFrame(update);