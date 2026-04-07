// ── Config ──────────────────────────────────────────────────────────────────

const ALIEN_TYPES = [
    { emoji: "👾", hp: 1, points: 10, color: "#44ffaa" },  // easy
    { emoji: "🛸", hp: 2, points: 25, color: "#ffdd55" },  // medium
    { emoji: "👽", hp: 3, points: 50, color: "#ff7777" },  // hard
];

const MAX_MISSES        = 10;
const BASE_TIME         = 30;   // seconds for wave 1
const BASE_ALIEN_COUNT  = 2;    // aliens on wave 1
const MAX_ALIEN_COUNT   = 5;
const TELEPORT_BASE_MS  = 2200; // teleport interval for wave 1
const TELEPORT_MIN_MS   = 700;  // fastest possible teleport

const GROUND_HEIGHT     = 52;   // px — must match #ground height in CSS
const HUD_HEIGHT        = 46;   // px — must match #hud height in CSS
const ALIEN_W           = 52;   // approximate alien element width
const ALIEN_H           = 62;   // approximate alien element height (emoji + bar)

// Ground decoration
const GROUND_TILES = "🌿🌿🌵🌿🏠🌿🌵🌿🌿🏠🌿🌵🌿";

// ── State ────────────────────────────────────────────────────────────────────

let score    = 0;
let misses   = 0;
let timeLeft = BASE_TIME;
let wave     = 1;
let running  = false;
let aliens   = [];

let timerInterval    = null;
let teleportInterval = null;

// ── DOM refs ─────────────────────────────────────────────────────────────────

const scoreEl  = document.getElementById("score");
const timerEl  = document.getElementById("timer");
const missesEl = document.getElementById("misses");
const waveEl   = document.getElementById("wave");
const overlay  = document.getElementById("overlay");
const startBtn = document.getElementById("start-btn");
const ground   = document.getElementById("ground");

ground.textContent = GROUND_TILES;

// ── Stars ────────────────────────────────────────────────────────────────────

function makeStars() {
    // Remove old stars first
    document.querySelectorAll(".star").forEach(s => s.remove());
    for (let i = 0; i < 90; i++) {
        const s   = document.createElement("div");
        s.className = "star";
        const sz  = Math.random() * 2 + 0.5;
        s.style.width            = sz + "px";
        s.style.height           = sz + "px";
        s.style.top              = Math.random() * 100 + "%";
        s.style.left             = Math.random() * 100 + "%";
        s.style.animationDuration = (Math.random() * 3 + 2).toFixed(1) + "s";
        s.style.animationDelay   = (Math.random() * 3).toFixed(1) + "s";
        document.body.appendChild(s);
    }
}

// ── Wave helpers ──────────────────────────────────────────────────────────────

function waveAlienCount() {
    return Math.min(BASE_ALIEN_COUNT + wave - 1, MAX_ALIEN_COUNT);
}

function waveTime() {
    return Math.max(BASE_TIME - (wave - 1) * 2, 12);
}

function waveTeleportMs() {
    return Math.max(TELEPORT_BASE_MS - (wave - 1) * 200, TELEPORT_MIN_MS);
}

// ── Spawn ────────────────────────────────────────────────────────────────────

function randomPosition(existing) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const minY = HUD_HEIGHT + 10;
    const maxY = h - GROUND_HEIGHT - ALIEN_H - 10;
    const maxX = w - ALIEN_W - 10;

    let x, y, tries = 0;
    do {
        x = 10 + Math.random() * (maxX - 10);
        y = minY + Math.random() * (maxY - minY);
        tries++;
    } while (
        tries < 40 &&
        existing.some(p => Math.abs(p.x - x) < 80 && Math.abs(p.y - y) < 80)
    );

    return { x, y };
}

function spawnAliens() {
    // Clear old aliens from DOM
    document.querySelectorAll(".alien").forEach(el => el.remove());
    aliens = [];

    const count    = waveAlienCount();
    const placed   = [];

    for (let i = 0; i < count; i++) {
        // Higher waves unlock tougher alien types
        const maxType = Math.min(wave - 1, ALIEN_TYPES.length - 1);
        const typeIdx = Math.floor(Math.random() * (maxType + 1));
        const type    = ALIEN_TYPES[typeIdx];

        // Build element
        const el      = document.createElement("div");
        el.className  = "alien";

        const body    = document.createElement("div");
        body.className = "alien-body";
        body.textContent = type.emoji;

        const hpWrap  = document.createElement("div");
        hpWrap.className = "hp-bar-wrap";

        const hpBar   = document.createElement("div");
        hpBar.className = "hp-bar";
        hpBar.style.width      = "100%";
        hpBar.style.background = type.color;

        hpWrap.appendChild(hpBar);
        el.appendChild(body);
        el.appendChild(hpWrap);
        document.body.appendChild(el);

        // Position
        const pos = randomPosition(placed);
        placed.push(pos);

        const alien = {
            el,
            hpBar,
            maxHp: type.hp,
            hp:    type.hp,
            type,
            x: pos.x,
            y: pos.y,
            cooldown: false,   // brief cooldown after a hit to prevent double-click
        };

        el.style.left = alien.x + "px";
        el.style.top  = alien.y + "px";

        el.addEventListener("click", function (e) {
            e.stopPropagation();   // prevent body miss-counter
            onAlienClick(alien);
        });

        aliens.push(alien);
    }

    waveEl.textContent = wave;
}

// ── Interaction ───────────────────────────────────────────────────────────────

function onAlienClick(alien) {
    if (!running || alien.cooldown) return;

    alien.hp--;
    alien.cooldown = true;
    setTimeout(() => { alien.cooldown = false; }, 130);

    // Update HP bar
    const pct = alien.hp / alien.maxHp;
    alien.hpBar.style.width = (pct * 100) + "%";
    if      (pct > 0.5)  alien.hpBar.style.background = alien.type.color;
    else if (pct > 0.25) alien.hpBar.style.background = "#ffaa33";
    else                 alien.hpBar.style.background = "#ff4444";

    // Shake animation
    alien.el.classList.remove("hit");
    void alien.el.offsetWidth;           // force reflow to restart animation
    alien.el.classList.add("hit");

    spawnFx(alien.x + 20, alien.y + 10, "💥", "hit-fx");

    if (alien.hp <= 0) {
        killAlien(alien);
    }
}

function killAlien(alien) {
    score += alien.type.points * wave;
    scoreEl.textContent = score;

    spawnFx(alien.x + 10, alien.y, "✨", "zap-fx");

    alien.el.style.opacity   = "0";
    alien.el.style.transform = "scale(0.2)";
    setTimeout(() => {
        if (alien.el.parentNode) alien.el.parentNode.removeChild(alien.el);
    }, 220);

    aliens = aliens.filter(a => a !== alien);

    if (aliens.length === 0) {
        nextWave();
    }
}

function onBodyClick() {
    if (!running) return;
    misses++;
    missesEl.textContent = misses;
    missFlash();
    if (misses >= MAX_MISSES) {
        endGame(false, "Too many misses!");
    }
}

// ── Effects ───────────────────────────────────────────────────────────────────

function spawnFx(x, y, emoji, className) {
    const el        = document.createElement("div");
    el.className    = className;
    el.textContent  = emoji;
    el.style.left   = x + "px";
    el.style.top    = y + "px";
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 550);
}

function missFlash() {
    const el     = document.createElement("div");
    el.className = "miss-flash";
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
}

// ── Timer & teleport ──────────────────────────────────────────────────────────

function startTimerAndTeleport() {
    timerInterval = setInterval(() => {
        if (!running) return;
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 8) timerEl.classList.add("danger");
        if (timeLeft <= 0) endGame(false, "Time's up!");
    }, 1000);

    teleportInterval = setInterval(teleportAliens, waveTeleportMs());
}

function teleportAliens() {
    if (!running) return;
    const placed = [];
    aliens.forEach(alien => {
        const pos    = randomPosition(placed);
        placed.push(pos);
        alien.x      = pos.x;
        alien.y      = pos.y;
        alien.el.style.left = alien.x + "px";
        alien.el.style.top  = alien.y + "px";
    });
}

// ── Wave progression ──────────────────────────────────────────────────────────

function nextWave() {
    clearInterval(timerInterval);
    clearInterval(teleportInterval);
    wave++;
    timeLeft = waveTime();
    timerEl.textContent = timeLeft;
    timerEl.classList.remove("danger");

    // Brief pause before spawning next wave
    setTimeout(() => {
        if (!running) return;
        spawnAliens();
        startTimerAndTeleport();
    }, 1000);
}

// ── Game lifecycle ────────────────────────────────────────────────────────────

function startGame() {
    score    = 0;
    misses   = 0;
    wave     = 1;
    timeLeft = waveTime();
    running  = true;

    scoreEl.textContent  = "0";
    missesEl.textContent = "0";
    timerEl.textContent  = timeLeft;
    timerEl.classList.remove("danger");
    waveEl.textContent   = "1";

    overlay.style.display = "none";

    clearInterval(timerInterval);
    clearInterval(teleportInterval);

    spawnAliens();
    startTimerAndTeleport();
}

function endGame(won, reason) {
    running = false;
    clearInterval(timerInterval);
    clearInterval(teleportInterval);

    // Remove all aliens
    document.querySelectorAll(".alien").forEach(el => el.remove());
    aliens = [];

    overlay.innerHTML = `
        <h2>${won ? "🎉 CLEARED" : "💀 GAME OVER"}</h2>
        <p>${reason}<br><br>
        Score: <strong>${score}</strong><br>
        Wave reached: ${wave}</p>
        <button id="start-btn">PLAY AGAIN</button>
    `;
    overlay.style.display = "flex";
    document.getElementById("start-btn").addEventListener("click", startGame);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

makeStars();

// Miss detection on body click (aliens stop propagation)
document.body.addEventListener("click", onBodyClick);

// Start button (initial)
startBtn.addEventListener("click", startGame);