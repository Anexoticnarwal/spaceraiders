// Asteroid Shooter Game Logic

// Initialize variables
let ship;
let bullets = [];
let asteroids = [];
let isGameOver = false;

// Setup game canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ship object
class Ship {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 30;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
    }
    move(direction) {
        if (direction === 'LEFT' && this.x > 0) {
            this.x -= this.speed;
        } else if (direction === 'RIGHT' && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }
}

// Bullet object
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 10;
    }
    update() {
        this.y -= this.speed;
    }
}

// Asteroid object
class Asteroid {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.size = Math.random() * 20 + 20;
        this.speed = Math.random() * 3 + 1;
    }
    update() {
        this.y += this.speed;
    }
}

// Initialize game
function init() {
    ship = new Ship();
    spawnAsteroid();
    requestAnimationFrame(gameLoop);
    document.addEventListener('keydown', handleKeyDown);
}

// Game loop
function gameLoop() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBullets();
    updateAsteroids();
    detectCollisions();
    draw();
    requestAnimationFrame(gameLoop);
}

function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
        ship.move('LEFT');
    } else if (event.key === 'ArrowRight') {
        ship.move('RIGHT');
    } else if (event.key === ' ') {
        fireBullet();
    }
}

function fireBullet() {
    bullets.push(new Bullet(ship.x + ship.width / 2, ship.y));
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function spawnAsteroid() {
    asteroids.push(new Asteroid());
    setTimeout(spawnAsteroid, 1000);
}

function updateAsteroids() {
    asteroids.forEach((asteroid, index) => {
        asteroid.update();
        if (asteroid.y > canvas.height) {
            asteroids.splice(index, 1);
        }
    });
}

function detectCollisions() {
    // Check collision between bullets and asteroids
    bullets.forEach((bullet, bulletIndex) => {
        asteroids.forEach((asteroid, asteroidIndex) => {
            if (bullet.y < asteroid.y + asteroid.size &&
                bullet.x > asteroid.x && 
                bullet.x < asteroid.x + asteroid.size) {
                // Collision detected
                bullets.splice(bulletIndex, 1);
                asteroids.splice(asteroidIndex, 1);
            }
        });
    });

    // Check collision between ship and asteroids
    asteroids.forEach((asteroid) => {
        if (ship.x < asteroid.x + asteroid.size &&
            ship.x + ship.width > asteroid.x && 
            ship.y < asteroid.y + asteroid.size && 
            ship.y + ship.height > asteroid.y) {
            isGameOver = true;
        }
    });
}

function draw() {
    // Draw ship
    ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
    // Draw bullets
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    // Draw asteroids
    asteroids.forEach(asteroid => {
        ctx.fillRect(asteroid.x, asteroid.y, asteroid.size, asteroid.size);
    });
}

// Save game state
function saveGame() {
    const gameState = {
        ship: { x: ship.x, y: ship.y },
        bullets: bullets,
        asteroids: asteroids,
        isGameOver: isGameOver
    };
    localStorage.setItem('asteroidShooterGame', JSON.stringify(gameState));
}

// Load game state
function loadGame() {
    const gameState = JSON.parse(localStorage.getItem('asteroidShooterGame'));
    if (gameState) {
        ship.x = gameState.ship.x;
        ship.y = gameState.ship.y;
        bullets = gameState.bullets;
        asteroids = gameState.asteroids;
        isGameOver = gameState.isGameOver;
    }
}

init();
// Use loadGame to start the game from saved state if available
loadGame();