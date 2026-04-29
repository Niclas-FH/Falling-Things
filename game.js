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

function showTutorial() {
    document.getElementById('startMenu').classList.remove('active');
    document.getElementById('tutorialMenu').classList.add('active');
}

function closeTutorial() {
    document.getElementById('tutorialMenu').classList.remove('active');
    document.getElementById('startMenu').classList.add('active');
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
    energy = 0; enemies = []; items = []; spawnTimer = 0; itemTimer = 0; laserSpawnCounter = 0;
    waveSpawnCount = 0; lastWave = 1;
    enemiesPerSpawn = 1; gameOver = false; isPaused = false; isUpgradePaused = false;
    upgradeReady = false; 
    
    player.x = 400; player.y = 500;
    lastTime = performance.now();
    
    ui.showGameOver(false);
    ui.showPause(false);
    ui.showUpgrade(false);
    
    if(gameInterval) clearInterval(gameInterval);
    
    initAudio();
    initVolume();
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
function goToStart() { 
    stopBackgroundMusic();
    gameOver = false;
    ui.showGameOver(false);
    ui.showStart(true);
}

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
        // Wenn sich die Welle ändert, reset Wave-Counter
        if (enemiesPerSpawn !== lastWave) {
            lastWave = enemiesPerSpawn;
            waveSpawnCount = 0;
        }
        
        for(let i=0; i<enemiesPerSpawn; i++) enemies.push(new Entity('enemy'));
        
        // Laser-Spawn-Logik: maximal 1 Laser auf dem Bildschirm
        if (enemiesPerSpawn >= 2) {
            waveSpawnCount++;
            let laserSpawnPoints = [];
            
            if (enemiesPerSpawn === 2) {
                laserSpawnPoints = [3]; // Welle 2: 1 Laser insgesamt
            } else if (enemiesPerSpawn === 3) {
                laserSpawnPoints = [4, 12]; // Welle 3: 2 Laser insgesamt mit Abstand
            } else {
                laserSpawnPoints = [4, 12, 20]; // Welle 4+: 3 Laser insgesamt mit Abstand
            }
            
            // Spawne Laser basierend auf Spawn-Index der Welle
            if (laserSpawnPoints.includes(waveSpawnCount)) {
                enemies.push(new LaserLine());
            }
        }
        
        spawnTimer = 0;
    }

    itemTimer += dt;
    if (itemTimer >= 20) { items.push(new Entity('heart')); itemTimer = 0; }

    [enemies, items].forEach(list => {
        for (let i = list.length - 1; i >= 0; i--) {
            list[i].update(dt, scale, Math.min(2000 / 300, 1 + score/1500));
            
            // Collision-Detection basierend auf Entity-Typ
            let collides = false;
            if (list[i].type === 'laser') {
                // Laser: 800x10, überprüfe Y-Überlapp
                collides = player.y < list[i].y + list[i].height && player.y + 40 > list[i].y;
            } else {
                // Normale Entities: 30x30
                collides = player.x < list[i].x + 30 && player.x + 40 > list[i].x && 
                           player.y < list[i].y + 30 && player.y + 40 > list[i].y;
            }
            
            if (collides) {
                if (list[i].type === 'enemy' || list[i].type === 'laser') {
                    lives--;
                    if (lives <= 0) {
                        gameOver = true;
                        stopBackgroundMusic();
                        ui.showGameOver(true);
                    }
                } else {
                    if (lives < maxLives) {
                        lives++;
                    } else {
                        score += 100; // Bonus für volle Herzen
                    }
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