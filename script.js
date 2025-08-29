let gameState = {
    isRunning: false,
    score: 0,
    speed: 1,
    playerPosition: 200,
    enemyCars: [],
    gameLoop: null,
    keys: {
        left: false,
        right: false
    },
    gameStartTime: 0
};

const gameContainer = document.getElementById('gameContainer');
const playerCar = document.getElementById('playerCar');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const roadLines = document.querySelector('.road-lines');

const GAME_WIDTH = 450;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 15;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;
const LANES = [75, 150, 200, 275, 325]; 

function startGame() {
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.speed = 1;
    gameState.playerPosition = 275;
    gameState.enemyCars = [];
    
    playerCar.style.left = gameState.playerPosition + 'px';
    scoreElement.textContent = gameState.score;
    speedElement.textContent = gameState.speed;
    gameOverScreen.style.display = 'none';
    
    document.querySelectorAll('.enemy-car').forEach(car => car.remove());
    
    gameState.gameLoop = setInterval(updateGame, 20);
    setTimeout(spawnEnemyCar, 1000);
}

function updateGame() {
    if (!gameState.isRunning) return;

    if (gameState.keys.left) {
        gameState.playerPosition = Math.max(0, gameState.playerPosition - PLAYER_SPEED);
        playerCar.style.left = gameState.playerPosition + 'px';
    }
    if (gameState.keys.right) {
        gameState.playerPosition = Math.min(GAME_WIDTH - CAR_WIDTH, gameState.playerPosition + PLAYER_SPEED);
        playerCar.style.left = gameState.playerPosition + 'px';
    }

    gameState.enemyCars.forEach((car, index) => {
        car.y += gameState.speed * 4;
        
        car.element.style.top = car.y + 'px';
        
        if (car.y > GAME_HEIGHT) {
            car.element.remove();
            gameState.enemyCars.splice(index, 1);
            gameState.score += 10;
            scoreElement.textContent = gameState.score;
        }

        if (checkCollision(car)) {
            endGame(car);
            return;
        }
    });

    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - gameState.gameStartTime) / 1000;
    const newSpeed = parseFloat((1 + Math.floor(elapsedSeconds / 10) * 0.1).toFixed(1));
    
    if (newSpeed !== gameState.speed && newSpeed <= 5) {
        gameState.speed = newSpeed;
        speedElement.textContent = gameState.speed.toFixed(1);
    }
}

function spawnEnemyCar() {
    if (!gameState.isRunning) return;

    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const enemyCar = document.createElement('div');
    enemyCar.className = 'car enemy-car';
    enemyCar.style.left = lane + 'px';
    enemyCar.style.top = '-80px';
    
    const carColors = [
        'linear-gradient(45deg, #4444ff, #3333cc)',
        'linear-gradient(45deg, #44ff44, #33cc33)',
        'linear-gradient(45deg, #ff44ff, #cc33cc)',
        'linear-gradient(45deg, #ffff44, #cccc33)'
    ];
    enemyCar.style.background = carColors[Math.floor(Math.random() * carColors.length)];
    
    gameContainer.appendChild(enemyCar);
    
    gameState.enemyCars.push({
        element: enemyCar,
        x: lane,
        y: -80
    });

    const spawnDelay = Math.max(800 - (gameState.speed * 100), 300);
    setTimeout(spawnEnemyCar, spawnDelay);
}

function checkCollision(enemyCar) {
    const padding = 8; 
    
    const playerRect = {
        x: gameState.playerPosition + padding,
        y: GAME_HEIGHT - 130 + padding,
        width: CAR_WIDTH - (padding * 2),
        height: CAR_HEIGHT - (padding * 2)
    };
    
    const enemyRect = {
        x: enemyCar.x + padding,
        y: enemyCar.y + padding,
        width: CAR_WIDTH - (padding * 2),
        height: CAR_HEIGHT - (padding * 2)
    };
    
    return playerRect.x < enemyRect.x + enemyRect.width &&
            playerRect.x + playerRect.width > enemyRect.x &&
            playerRect.y < enemyRect.y + enemyRect.height &&
            playerRect.y + playerRect.height > enemyRect.y;
}

function endGame(collidedCar) {
    gameState.isRunning = false;
    clearInterval(gameState.gameLoop);

    roadLines.classList.add('paused');

    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = (gameState.playerPosition + CAR_WIDTH/2 - 30) + 'px';
    explosion.style.top = (GAME_HEIGHT - 130 + CAR_HEIGHT/2 - 30) + 'px';
    gameContainer.appendChild(explosion);
    
    setTimeout(() => explosion.remove(), 300);
    
    finalScoreElement.textContent = gameState.score;
    setTimeout(() => {
        gameOverScreen.style.display = 'block';
    }, 500);
}

function restartGame() {
    startGame();
}

document.addEventListener('keydown', (e) => {
    if (!gameState.isRunning) return;
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            gameState.keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            gameState.keys.right = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            gameState.keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            gameState.keys.right = false;
            break;
    }
});

startGame();