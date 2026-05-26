
// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdFrames = [];
let birdFrameIndex = 0;
let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeGap = 180;

let topPipeImg;
let bottomPipeImg;
let bgImg;

// physics
let velocityX = -2.5;
let velocityY = 0;
let gravity = 0.35;
let jumpForce = -7.8;
let maxFallSpeed = 12;

let gameState = "Start";
let score = 0;
let bestScore = Number(localStorage.getItem("flappyHighScore")) || 0;
let lastTime = 0;
let spawnTimer = 0;
let spawnInterval = 1500;
let sounds = {};

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    loadAssets();
    resizeCanvas();

    document.addEventListener("keydown", handleInput);
    document.addEventListener("mousedown", handleInput);
    document.addEventListener("touchstart", handleTouch, { passive: false });
    window.addEventListener("resize", resizeCanvas);

    requestAnimationFrame(update);
}

function loadAssets() {
    birdFrames = [];
    for (let i = 0; i < 4; i += 1) {
        const frame = new Image();
        frame.src = `./flappybird${i}.png`;
        birdFrames.push(frame);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    bgImg = new Image();
    bgImg.src = "./flappybirdbg.png";

    loadSound("wing", "./sfx_wing.wav");
    loadSound("point", "./sfx_point.wav");
    loadSound("hit", "./sfx_hit.wav");
    loadSound("die", "./sfx_die.wav");
    loadSound("swoosh", "./sfx_swooshing.wav");
}

function loadSound(name, src) {
    const sound = new Audio(src);
    sound.volume = 0.35;
    sounds[name] = sound;
}

function playSound(name) {
    const sound = sounds[name];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {
        // ignore autoplay restrictions until first user interaction
    });
}

function resizeCanvas() {
    const screenWidth = Math.min(window.innerWidth - 24, 420);
    const screenHeight = window.innerHeight - 24;
    const aspect = boardWidth / boardHeight;
    let width = screenWidth;
    let height = Math.round(width / aspect);

    if (height > screenHeight) {
        height = screenHeight;
        width = Math.round(height * aspect);
    }

    board.style.width = `${width}px`;
    board.style.height = `${height}px`;
}

function handleInput(event) {
    if (event.type === "keydown") {
        if (event.code !== "Space" && event.code !== "ArrowUp" && event.code !== "KeyX") {
            return;
        }
    }

    event.preventDefault();

    if (gameState === "Start") {
        startGame();
    } else if (gameState === "Playing") {
        flap();
    } else if (gameState === "GameOver") {
        resetGame();
    }
}

function handleTouch(event) {
    event.preventDefault();
    handleInput(event);
}

function startGame() {
    gameState = "Playing";
    score = 0;
    velocityY = 0;
    pipeArray = [];
    spawnTimer = 0;
    playSound("swoosh");
}

function resetGame() {
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    spawnTimer = 0;
    gameState = "Start";
}

function flap() {
    velocityY = jumpForce;
    playSound("wing");
}

function update(timestamp = 0) {
    const delta = Math.min(timestamp - lastTime, 34);
    lastTime = timestamp;

    context.clearRect(0, 0, board.width, board.height);
    drawBackground();

    if (gameState === "Playing") {
        updateBird(delta);
        updatePipes(delta);
    }

    drawBird();
    drawOverlay();
    requestAnimationFrame(update);
}

function drawBackground() {
    if (bgImg.complete) {
        context.drawImage(bgImg, 0, 0, board.width, board.height);
    } else {
        context.fillStyle = "#70c5ce";
        context.fillRect(0, 0, board.width, board.height);
    }
}

function updateBird(delta) {
    velocityY = Math.min(velocityY + gravity, maxFallSpeed);
    bird.y += velocityY;
    bird.y = Math.max(0, bird.y);

    if (bird.y + bird.height >= board.height) {
        gameState = "GameOver";
        playSound("hit");
        playSound("die");
        updateBestScore();
    }
}

function updatePipes(delta) {
    spawnTimer += delta;
    if (spawnTimer > spawnInterval) {
        placePipes();
        spawnTimer = 0;
    }

    const speed = velocityX - Math.min(score * 0.03, 1.8);
    for (let i = pipeArray.length - 1; i >= 0; i -= 1) {
        const pipe = pipeArray[i];
        pipe.x += speed;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (pipe.isTop && !pipe.scored && bird.x > pipe.x + pipe.width) {
            score += 1;
            pipe.scored = true;
            playSound("point");
        }

        if (detectCollision(bird, pipe)) {
            gameState = "GameOver";
            playSound("hit");
            playSound("die");
            updateBestScore();
        }

        if (pipe.x + pipe.width < 0) {
            pipeArray.splice(i, 1);
        }
    }
}

function placePipes() {
    const maxOffset = pipeHeight / 2.6;
    const randomY = -pipeHeight / 4 - Math.random() * maxOffset;
    const gap = Math.max(pipeGap - Math.floor(score * 1.5), 130);

    const topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomY,
        width: pipeWidth,
        height: pipeHeight,
        isTop: true,
        scored: false,
    };

    const bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomY + pipeHeight + gap,
        width: pipeWidth,
        height: pipeHeight,
        isTop: false,
    };

    pipeArray.push(topPipe, bottomPipe);
}

function drawBird() {
    birdFrameIndex += 0.18;
    if (birdFrameIndex >= birdFrames.length) {
        birdFrameIndex = 0;
    }

    const frame = birdFrames[Math.floor(birdFrameIndex)];
    const angle = Math.max(Math.min(velocityY / 12, 0.8), -0.8);

    context.save();
    context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    context.rotate(angle);
    if (frame.complete) {
        context.drawImage(frame, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    } else {
        context.fillStyle = "#ffdd57";
        context.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    }
    context.restore();
}

function drawOverlay() {
    context.fillStyle = "rgba(0, 0, 0, 0.45)";
    context.font = "28px Inter, sans-serif";
    context.textAlign = "center";
    context.fillStyle = "rgba(0, 0, 0, 0.3)";
    context.fillRect(12, 12, 130, 58);

    context.fillStyle = "#ffffff";
    context.textAlign = "left";
    context.fillText(`Score: ${score}`, 20, 42);
    context.fillText(`Best: ${bestScore}`, 20, 74);

    if (gameState === "Start") {
        context.fillStyle = "rgba(0, 0, 0, 0.55)";
        context.fillRect(24, board.height / 2 - 80, board.width - 48, 140);

        context.fillStyle = "#ffffff";
        context.font = "bold 32px Inter, sans-serif";
        context.fillText("FLAPPY BIRD", board.width / 2, board.height / 2 - 24);
        context.font = "18px Inter, sans-serif";
        context.fillText("Tap / Click / Space to start", board.width / 2, board.height / 2 + 16);
        context.fillText("Touch to fly and beat your high score!", board.width / 2, board.height / 2 + 46);
    } else if (gameState === "GameOver") {
        context.fillStyle = "rgba(0, 0, 0, 0.55)";
        context.fillRect(24, board.height / 2 - 80, board.width - 48, 140);

        context.fillStyle = "#ffeb3b";
        context.font = "bold 36px Inter, sans-serif";
        context.fillText("GAME OVER", board.width / 2, board.height / 2 - 12);
        context.font = "18px Inter, sans-serif";
        context.fillStyle = "#ffffff";
        context.fillText(`Last Score: ${score}`, board.width / 2, board.height / 2 + 26);
        context.fillText("Tap or press space to try again", board.width / 2, board.height / 2 + 56);
    }
}

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("flappyHighScore", bestScore.toString());
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
