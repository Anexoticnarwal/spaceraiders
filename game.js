// Asteroid Shooter Game Logic

// Initialize variables
let ship;
let bullets = [];
let asteroids = [];
let isGameOver = false;
let score = 0;

// Touch control states
let isMovingLeft = false;
let isMovingRight = false;
let isShooting = false;

// Setup game canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.75;
    const aspectRatio = 4 / 3;
    
    if (maxWidth / maxHeight > aspectRatio) {
        canvas.width = maxHeight * aspectRatio;
        canvas.height = maxHeight;
    } else {
        canvas.width = maxWidth;
        canvas.height = maxWidth / aspectRatio;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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
    setupTouchControls();
    setupKeyboardControls();
    requestAnimationFrame(gameLoop);
}

// Setup touch controls for mobile
function setupTouchControls() {
    const leftBtn = document.getElementById('leftButton');
    const rightBtn = document.getElementById('rightButton');
    const shootBtn = document.getElementById('shootButton');

    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isMovingLeft = true;
        });
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            isMovingLeft = false;
        });
    }

    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isMovingRight = true;
        });
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            isMovingRight = false;
        });
    }

    if (shootBtn) {
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isShooting = true;
        });
        shootBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            isShooting = false;
        });
    }
}

// Setup keyboard controls for desktop
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            isMovingLeft = true;
        } else if (e.key === 'ArrowRight') {
            isMovingRight = true;
        } else if (e.key === ' ') {
            e.preventDefault();
            isShooting = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') {
            isMovingLeft = false;
        } else if (e.key === 'ArrowRight') {
            isMovingRight = false;
        } else if (e.key === ' ') {
            isShooting = false;
        }
    });
}

// Game loop
function gameLoop() {
    if (isGameOver) {
        drawGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle continuous movement
    if (isMovingLeft) {
        ship.move('LEFT');
    }
    if (isMovingRight) {
        ship.move('RIGHT');
    }
    if (isShooting) {
        fireBullet();
    }

    updateBullets();
    updateAsteroids();
    detectCollisions();
    draw();
    requestAnimationFrame(gameLoop);
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
    if (!isGameOver) {
        asteroids.push(new Asteroid());
        setTimeout(spawnAsteroid, 1000);
    }
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
    for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = bullets[bulletIndex];
        for (let asteroidIndex = asteroids.length - 1; asteroidIndex >= 0; asteroidIndex--) {
            const asteroid = asteroids[asteroidIndex];
            if (bullet.y < asteroid.y + asteroid.size &&
                bullet.x > asteroid.x && 
                bullet.x < asteroid.x + asteroid.size) {
                bullets.splice(bulletIndex, 1);
                asteroids.splice(asteroidIndex, 1);
                score += 10;
                break;
            }
        }
    }

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
    // Draw ship (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ship.x, ship.y, ship.width, ship.height);

    // Draw bullets (yellow)
    ctx.fillStyle = '#FFFF00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw asteroids (gray)
    ctx.fillStyle = '#888888';
    asteroids.forEach(asteroid => {
        ctx.fillRect(asteroid.x, asteroid.y, asteroid.size, asteroid.size);
    });

    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText('Refresh to play again', canvas.width / 2, canvas.height / 2 + 100);
    ctx.textAlign = 'left';
}

// Save game state
function saveGame() {
    const gameState = {
        ship: { x: ship.x, y: ship.y },
        bullets: bullets,
        asteroids: asteroids,
        isGameOver: isGameOver,
        score: score
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
        score = gameState.score || 0;
    }
}

init();