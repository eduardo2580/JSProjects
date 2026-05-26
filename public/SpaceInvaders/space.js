const tileSize = 32;
const rows = 16;
const columns = 16;
const boardWidth = tileSize * columns;
const boardHeight = tileSize * rows;

let board;
let context;
let ship;
let shipImg;
let alienImg;
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;
let bulletArray = [];
let bulletVelocityY = -12;
let lastShot = 0;
let shotInterval = 180;
let score = 0;
let level = 1;
let bestScore = 0;
let gameState = 'ready';
let moveLeft = false;
let moveRight = false;
let shooting = false;
let spaceDown = false;
let stars = [];
let particles = [];
let messageText = '';
let messageTimer = 0;
let audioInitialized = false;
let audioContext;

window.onload = function() {
    board = document.getElementById('board');
    shipImg = new Image();
    shipImg.src = './ship.png';
    alienImg = new Image();
    alienImg.src = './alien.png';

    setupUI();
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    createStars();

    requestAnimationFrame(update);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
};

function setupUI() {
    bestScore = parseInt(localStorage.getItem('spaceInvadersBest')) || 0;

    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');

    document.getElementById('scoreValue').textContent = score;
    document.getElementById('levelValue').textContent = level;
    document.getElementById('bestValue').textContent = bestScore;

    setupControlButton(leftBtn, () => moveLeft = true, () => moveLeft = false);
    setupControlButton(rightBtn, () => moveRight = true, () => moveRight = false);
    setupControlButton(shootBtn, () => { shooting = true; tryShoot(); }, () => shooting = false);

    startBtn.addEventListener('click', () => {
        initAudio();
        startGame();
        hideOverlay();
    });

    restartBtn.addEventListener('click', () => {
        initAudio();
        startGame();
        hideOverlay();
    });

    showOverlay('Space Invaders', 'Touch the controls or use arrow keys + Space to shoot. Ready for the first wave?', false);
}

function initAudio() {
    if (audioInitialized) return;
    audioInitialized = true;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function setupControlButton(element, onDown, onUp) {
    if (!element) return;

    element.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        onDown();
    });
    element.addEventListener('pointerup', (event) => {
        event.preventDefault();
        if (onUp) onUp();
    });
    element.addEventListener('pointercancel', (event) => {
        event.preventDefault();
        if (onUp) onUp();
    });
    element.addEventListener('touchstart', (event) => {
        event.preventDefault();
        onDown();
    }, { passive: false });
    element.addEventListener('touchend', (event) => {
        event.preventDefault();
        if (onUp) onUp();
    }, { passive: false });
}

function setCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    board.width = boardWidth * dpr;
    board.height = boardHeight * dpr;
    board.style.width = '100%';
    board.style.height = '100%';
    context = board.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);
}

function startGame() {
    score = 0;
    level = 1;
    alienColumns = 3;
    alienRows = 2;
    alienVelocityX = 1;
    alienArray = [];
    bulletArray = [];
    particles = [];
    messageText = '';
    messageTimer = 0;
    gameState = 'playing';
    ship = {
        x: tileSize * columns / 2 - tileSize,
        y: tileSize * rows - tileSize * 2,
        width: tileSize * 2,
        height: tileSize
    };
    createAliens();
    createStars();
    updateStatus();
    playSound('start');
}

function showOverlay(title, message, showRestart) {
    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMessage = document.getElementById('overlay-message');
    const restartBtn = document.getElementById('restartBtn');

    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    restartBtn.classList.toggle('hidden', !showRestart);
    overlay.classList.remove('hidden');
}

function hideOverlay() {
    document.getElementById('overlay').classList.add('hidden');
}

function updateStatus() {
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('levelValue').textContent = level;
    document.getElementById('bestValue').textContent = bestScore;
}

function createStars() {
    stars = [];
    for (let i = 0; i < 110; i++) {
        stars.push({
            x: Math.random() * boardWidth,
            y: Math.random() * boardHeight,
            size: Math.random() * 2 + 0.4,
            speed: Math.random() * 0.35 + 0.1,
            alpha: 0.5 + Math.random() * 0.5
        });
    }
}

function drawStarfield() {
    for (const star of stars) {
        star.y += star.speed;
        if (star.y > boardHeight) {
            star.y = 0;
            star.x = Math.random() * boardWidth;
            star.speed = Math.random() * 0.35 + 0.1;
            star.size = Math.random() * 2 + 0.4;
        }
        context.fillStyle = `rgba(255,255,255,${star.alpha})`;
        context.fillRect(star.x, star.y, star.size, star.size);
    }
}

function update() {
    requestAnimationFrame(update);

    context.clearRect(0, 0, boardWidth, boardHeight);
    context.fillStyle = '#020306';
    context.fillRect(0, 0, boardWidth, boardHeight);
    drawStarfield();

    if (gameState !== 'playing') {
        if (ship) drawShip();
        drawParticles();
        drawMessage();
        return;
    }

    updateGameLogic();
    drawShip();
    drawAliens();
    drawBullets();
    drawParticles();
    drawMessage();
    updateStatus();
}

function updateGameLogic() {
    if (moveLeft && ship.x - 6 >= 0) ship.x -= 6;
    if (moveRight && ship.x + 6 + ship.width <= boardWidth) ship.x += 6;
    if (shooting) tryShoot();

    for (const alien of alienArray) {
        if (!alien.alive) continue;
        alien.x += alienVelocityX;
    }

    let borderTouched = false;
    for (const alien of alienArray) {
        if (!alien.alive) continue;
        if (alien.x + alien.width >= boardWidth || alien.x <= 0) {
            borderTouched = true;
            break;
        }
    }

    if (borderTouched) {
        alienVelocityX *= -1;
        for (const alien of alienArray) {
            if (alien.alive) alien.y += alienHeight;
        }
    }

    for (const alien of alienArray) {
        if (!alien.alive) continue;
        if (alien.y + alien.height >= ship.y) {
            gameOverSequence();
            return;
        }
    }

    for (const bullet of bulletArray) {
        if (bullet.used) continue;
        bullet.y += bulletVelocityY;
        for (const alien of alienArray) {
            if (!alien.alive) continue;
            if (detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 120;
                createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2);
                playSound('explosion');
            }
        }
    }

    bulletArray = bulletArray.filter((bullet) => !bullet.used && bullet.y + bullet.height > 0);

    if (alienCount <= 0) {
        nextWave();
    }
}

function drawShip() {
    if (shipImg.complete) {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    } else {
        context.fillStyle = '#78d7ff';
        context.fillRect(ship.x, ship.y, ship.width, ship.height);
    }
}

function drawAliens() {
    for (const alien of alienArray) {
        if (!alien.alive) continue;
        if (alienImg.complete) {
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
        } else {
            context.fillStyle = '#ff94d7';
            context.fillRect(alien.x, alien.y, alien.width, alien.height);
        }
    }
}

function drawBullets() {
    context.fillStyle = '#e7f8ff';
    for (const bullet of bulletArray) {
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawParticles() {
    const now = Date.now();
    particles = particles.filter(p => p.life > now);
    for (const particle of particles) {
        const progress = 1 - (particle.life - now) / particle.duration;
        context.fillStyle = `rgba(${particle.color.join(',')}, ${1 - progress})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * (1 - progress), 0, Math.PI * 2);
        context.fill();
    }
}

function drawMessage() {
    if (!messageText || messageTimer <= 0) return;
    context.save();
    context.globalAlpha = Math.max(0, messageTimer / 1400);
    context.fillStyle = 'rgba(255,255,255,0.9)';
    context.font = 'bold 22px Inter, system-ui, sans-serif';
    context.textAlign = 'center';
    context.fillText(messageText, boardWidth / 2, boardHeight / 2 - 20);
    context.restore();
    messageTimer -= 16;
}

function createAliens() {
    alienArray = [];
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            alienArray.push({
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            });
        }
    }
    alienCount = alienArray.length;
}

function nextWave() {
    level += 1;
    score += alienColumns * alienRows * 70;
    alienColumns = Math.min(alienColumns + 1, Math.floor(columns / 2) - 2);
    alienRows = Math.min(alienRows + 1, rows - 6);
    alienVelocityX += alienVelocityX > 0 ? 0.25 : -0.25;
    bulletArray = [];
    createAliens();
    showMessage(`Wave ${level} incoming!`);
    playSound('levelup');
}

function tryShoot() {
    if (gameState !== 'playing') return;
    initAudio();
    const now = Date.now();
    if (now - lastShot < shotInterval) return;
    lastShot = now;
    bulletArray.push({
        x: ship.x + ship.width * 0.5 - 2,
        y: ship.y - 10,
        width: 4,
        height: 12,
        used: false
    });
    playSound('shoot');
}

function gameOverSequence() {
    gameState = 'over';
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('spaceInvadersBest', bestScore);
    }
    showOverlay('Game Over', `Final score: ${score}. Tap restart to play again.`, true);
    updateStatus();
    playSound('gameover');
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function handleKeyDown(event) {
    if (event.code === 'ArrowLeft') {
        moveLeft = true;
        event.preventDefault();
    }
    if (event.code === 'ArrowRight') {
        moveRight = true;
        event.preventDefault();
    }
    if (event.code === 'Space') {
        if (!spaceDown) {
            shooting = true;
            tryShoot();
            spaceDown = true;
        }
        event.preventDefault();
    }
    if (gameState !== 'playing' && event.code === 'Space') {
        initAudio();
        startGame();
        hideOverlay();
    }
}

function handleKeyUp(event) {
    if (event.code === 'ArrowLeft') moveLeft = false;
    if (event.code === 'ArrowRight') moveRight = false;
    if (event.code === 'Space') {
        shooting = false;
        spaceDown = false;
    }
}

function createExplosion(x, y) {
    const baseColor = [255, 169, 118];
    const count = 12;
    for (let i = 0; i < count; i++) {
        particles.push({
            x,
            y,
            radius: Math.random() * 7 + 3,
            duration: 320 + Math.random() * 180,
            life: Date.now() + 320 + Math.random() * 180,
            color: baseColor
        });
    }
}

function playSound(type) {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.setValueAtTime(0, now);

    if (type === 'shoot') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(620, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.002, now + 0.18);
    } else if (type === 'explosion') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    } else if (type === 'levelup') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(320, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    } else if (type === 'gameover') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(160, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    } else if (type === 'start') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    }

    oscillator.start(now);
    oscillator.stop(now + 0.4);
}
