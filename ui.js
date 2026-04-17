var score = 0, lastMilestone = 0, lives = 1, maxLives = 1;
var playerSpeed = 400, slowMoFactor = 0.75;
var energy = 0, enemies = [], items = [], spawnTimer = 0, itemTimer = 0, enemiesPerSpawn = 1;
var gameOver = false, isPaused = false, isUpgradePaused = false, upgradeReady = false;
var highScore = localStorage.getItem('survivalProHighScore') ? parseInt(localStorage.getItem('survivalProHighScore')) : 0;

const ui = {
    showStart(visible) {
        document.getElementById('startMenu').classList.toggle('active', visible);
    },
    update() {
        let currentScore = Math.floor(score);
        document.getElementById('val-score').innerText = currentScore;
        
        document.getElementById('val-highscore').innerText = Math.max(currentScore, highScore);
        
        document.getElementById('val-speed').innerText = Math.round(playerSpeed);
        document.getElementById('val-wave').innerText = enemiesPerSpawn;
        
        let heartUI = "";
        for(let i=0; i<maxLives; i++) heartUI += (i < lives) ? "❤️" : "🖤";
        document.getElementById('val-lives').innerText = heartUI;
        
        document.getElementById('energy-fill').style.width = energy + "%";
    },
    showPause(visible) {
        document.getElementById('pauseMenu').classList.toggle('active', visible);
    },
    showUpgrade(visible) {
        document.getElementById('upgradeMenu').classList.toggle('active', visible);
    },
    showGameOver(visible) {
        document.getElementById('gameOverMenu').classList.toggle('active', visible);
        if (visible) {
            let finalScore = Math.floor(score);
            
            if (finalScore > highScore) {
                highScore = finalScore;
                localStorage.setItem('survivalProHighScore', highScore);
            }
            
            document.getElementById('finalScoreDisplay').innerText = "Score: " + finalScore;
            document.getElementById('highScoreDisplay').innerText = "Highscore: " + highScore;
        }
    }
};