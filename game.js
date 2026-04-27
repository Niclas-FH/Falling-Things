let canvas, ctx, lastTime = 0;
let gameInterval;
const FPS = 60;
let backgroundMusic;
let isSlowMotionActive = false;

// Musik-Steuerung
function initAudio() {
    if (!backgroundMusic) {
        backgroundMusic = document.getElementById('backgroundMusic');
    }
}

function playBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.play().catch(e => console.log('Musik konnte nicht abgespielt werden:', e));
    }
}

function pauseBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

function stopBackgroundMusic() {
    pauseBackgroundMusic();
    if (backgroundMusic) {
        backgroundMusic.currentTime = 0;
    }
}

function setVolume(value) {
    if (backgroundMusic) {
        backgroundMusic.volume = value / 10;
    }
    localStorage.setItem('survivalProVolume', value);
}

function updateVolumeDisplay(source, value) {
    if (source === 'Start') {
        document.getElementById('volumeValueStart').innerText = value;
        document.getElementById('volumeSliderPause').value = value;
        document.getElementById('volumeValuePause').innerText = value;
    } else if (source === 'Pause') {
        document.getElementById('volumeValuePause').innerText = value;
        document.getElementById('volumeSliderStart').value = value;
        document.getElementById('volumeValueStart').innerText = value;
    }
}

function initVolume() {
    const savedVolume = localStorage.getItem('survivalProVolume');
    const volume = savedVolume ? parseInt(savedVolume) : 10;
    document.getElementById('volumeSliderStart').value = volume;
    document.getElementById('volumeValueStart').innerText = volume;
    document.getElementById('volumeSliderPause').value = volume;
    document.getElementById('volumeValuePause').innerText = volume;
    setVolume(volume);
}

function initGame() {
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        canvas.width = 800;
        canvas.height = 600;
        const wrapper = document.getElementById('game-wrapper');
        const sidebar = document.getElementById('sidebar');
        wrapper.insertBefore(canvas, sidebar);
        ctx = canvas.getContext('2d');
        loadImages();  
    }

    score = 0; lastMilestone = 0; lives = 1; maxLives = 1;
    playerSpeed = 400; slowMoFactor = 0.75;
    energy = 0; enemies = []; items = []; spawnTimer = 0; itemTimer = 0;
    enemiesPerSpawn = 1; gameOver = false; isPaused = false; isUpgradePaused = false;
    upgradeReady = false; 
    
    player.x = 400; player.y = 500;
    lastTime = performance.now();
    
    ui.showGameOver(false);
    ui.showPause(false);
    ui.showUpgrade(false);
    
    if(gameInterval) clearInterval(gameInterval);
    
    initAudio();
    playBackgroundMusic();
    
    gameInterval = setInterval(loop, 1000 / FPS);
}

function togglePause() {
    if (gameOver || isUpgradePaused) return;
    isPaused = !isPaused;
    ui.showPause(isPaused);
    if (!isPaused) {
        lastTime = performance.now();
    }
}

function resumeGame() { if(isPaused) togglePause(); }
function resetGame() { initGame(); }

function selectUpgrade(type) {
    if (type === 'speed') playerSpeed *= 1.3;
    if (type === 'slow') slowMoFactor *= 0.75;
    if (type === 'life') { maxLives++; lives++; }
    enemiesPerSpawn++;
    upgradeReady = false;
    isUpgradePaused = false;
    ui.showUpgrade(false);
    lastTime = performance.now();
}

function executeTeleport() {
    if (energy < 30) return;
    let tx = player.x, ty = player.y;
    if (input.keys['ArrowLeft']) tx -= 130;
    if (input.keys['ArrowRight']) tx += 130;
    if (input.keys['ArrowUp']) ty -= 130;
    if (input.keys['ArrowDown']) ty += 130;
    player.x = Math.max(0, Math.min(tx, 760));
    player.y = Math.max(300, Math.min(ty, 560));
    energy -= 30;
}

function executeSuperAbility() {
    if (energy < 50) return;
   
    enemies = [];
    energy -= 50;
}

function loop() {
    if (gameOver || isPaused || isUpgradePaused) return;
    
    const timeStamp = performance.now();
    const dt = (timeStamp - lastTime) / 1000;
    lastTime = timeStamp;

    if (Math.floor(score / 500) > lastMilestone) {
        lastMilestone = Math.floor(score / 500);
        upgradeReady = true;
        isUpgradePaused = true;
        ui.showUpgrade(true);
        return;
    }

    const slow = input.keys['Space'] && !input.isArrowPressed() && energy > 0;
    const scale = slow ? slowMoFactor : 1.0;
    
    // Musik-Geschwindigkeit anpassen bei SlowMotion
    if (slow && !isSlowMotionActive) {
        isSlowMotionActive = true;
        if (backgroundMusic) backgroundMusic.playbackRate = 0.5;
    } else if (!slow && isSlowMotionActive) {
        isSlowMotionActive = false;
        if (backgroundMusic) backgroundMusic.playbackRate = 1.0;
    }
    
    if (slow) energy -= 40 * dt;

    player.update(dt);
    score += dt * 10;

    spawnTimer += dt * scale * (1 + score/1500);
    if (spawnTimer >= 1) {
        for(let i=0; i<enemiesPerSpawn; i++) enemies.push(new Entity('enemy'));
        spawnTimer = 0;
    }

    itemTimer += dt;
    if (itemTimer >= 20) { items.push(new Entity('heart')); itemTimer = 0; }

    [enemies, items].forEach(list => {
        for (let i = list.length - 1; i >= 0; i--) {
            list[i].update(dt, scale, 1 + score/1500);
            if (player.x < list[i].x + 30 && player.x + 40 > list[i].x && 
                player.y < list[i].y + 30 && player.y + 40 > list[i].y) {
                if (list[i].type === 'enemy') {
                    lives--;
                    if (lives <= 0) {
                        gameOver = true;
                        stopBackgroundMusic();
                        ui.showGameOver(true);
                    }
                } else {
                    if (lives < maxLives) lives++;
                }
                list.splice(i, 1);
            } else if (list[i].y > 600) {
                list.splice(i, 1);
            }
        }
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#988791"; ctx.fillRect(0, 0, canvas.width, canvas.height); // Boden
    // Optional: Für Hintergrundbilder später hinzufügbar
    player.draw(ctx);
    enemies.forEach(e => e.draw(ctx));
    items.forEach(h => h.draw(ctx));
    ui.update(); 
}

function startGame() {
    ui.showStart(false);
    initGame();
}

initVolume();
input.init();