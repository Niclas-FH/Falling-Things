const images = {};
function loadImages() {
    const imageFiles = {
        'enemy': 'images/enemy.png',
        'heart': 'images/heart.png',
        'background': 'images/background.png',
        'bonus100': 'images/100.png'
    };
    
    // Spieler-Sprites für alle Tier und Richtungen laden
    const playerTiers = ['player', 'playerIron', 'playerGold', 'playerDiamond', 'playerNetherite'];
    const playerStates = ['', 'Right', 'Left', 'Down', 'Up', 'Slow'];
    
    playerTiers.forEach(tier => {
        playerStates.forEach(state => {
            const key = tier + state;
            const path = `images/${tier}/${tier}${state}.png`;
            imageFiles[key] = path;
        });
    });
    
    for (let key in imageFiles) {
        images[key] = new Image();
        images[key].src = imageFiles[key];
        
        images[key].onerror = () => {
            console.error(`Fehler: Bild ${imageFiles[key]} konnte nicht geladen werden. Pfad korrekt?`);
        };
    }
}

class Player {
    constructor() {
        this.size = 40;
        this.x = 400;
        this.y = 500;
        this.lastDirection = ''; 
        this.isSlowActive = false;
        this.slowAnimationTimer = 0;
        this.slowAnimationInterval = 0.15; // Sekunden für Animation
        this.bonusTimer = 0;
    }

    triggerBonus100() {
        this.bonusTimer = 1.2; 
    }
    
    getTierName() {
        
        switch(maxLives) {
            case 1: return 'player';
            case 2: return 'playerIron';
            case 3: return 'playerGold';
            case 4: return 'playerDiamond';
            case 5: return 'playerNetherite';
            default: return 'playerNetherite';
        }
    }
    
    getPlayerImageName() {
        const tier = this.getTierName();
        
        if (this.isSlowActive) {
            return tier + 'Slow';
        }
        
        return tier + this.lastDirection;
    }
    
    update(dt) {
        let moved = false;
        let currentDirection = '';
        
        if (input.keys['KeyA']) { this.x -= playerSpeed * dt; moved = true; currentDirection = 'Left'; }
        if (input.keys['KeyD']) { this.x += playerSpeed * dt; moved = true; currentDirection = 'Right'; }
        if (input.keys['KeyW']) { this.y -= playerSpeed * dt; moved = true; currentDirection = 'Up'; }
        if (input.keys['KeyS']) { this.y += playerSpeed * dt; moved = true; currentDirection = 'Down'; }
        
        if (!moved && !this.isSlowActive) {
            this.lastDirection = '';
        } else if (moved) {
            this.lastDirection = currentDirection;
        }
        
        if (moved && energy < 100) energy += 10 * dt;
        
        this.x = Math.max(0, Math.min(this.x, 800 - this.size));
        this.y = Math.max(0, Math.min(this.y, 600 - this.size));
    }
    
    draw(ctx, isSlow = false) {
        this.isSlowActive = isSlow;
        
        if (this.isSlowActive) {
            this.slowAnimationTimer += 1 / 60; // Etwa 1/60 pro Frame bei 60 FPS
            if (this.slowAnimationTimer >= this.slowAnimationInterval * 2) {
                this.slowAnimationTimer = 0;
            }
        } else {
            this.slowAnimationTimer = 0;
        }
        
        const imageName = this.getPlayerImageName();
        const image = images[imageName];
        
        if (image && image.complete) {
            if (this.isSlowActive) {
                
                const isLeftHalf = this.slowAnimationTimer < this.slowAnimationInterval;
                const sourceX = isLeftHalf ? 0 : image.width / 2;
                const sourceY = 0;
                const sourceWidth = image.width / 2;
                const sourceHeight = image.height;
                
                ctx.drawImage(
                    image,
                    sourceX, sourceY, sourceWidth, sourceHeight,
                    this.x, this.y, this.size, this.size
                );
            } else {
                ctx.drawImage(image, this.x, this.y, this.size, this.size);
            }
        } else {
            // Fallback wenn Bild nicht geladen
            ctx.fillStyle = '#3498db';
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
        
        if (input.isArrowPressed() && energy >= 30) {
            let tx = this.x, ty = this.y;
            if (input.keys['ArrowLeft']) tx -= 160;
            if (input.keys['ArrowRight']) tx += 160;
            if (input.keys['ArrowUp']) ty -= 160;
            if (input.keys['ArrowDown']) ty += 160;
            ctx.strokeStyle = 'rgb(153, 0, 255)'; 
            ctx.lineWidth = 5;                     
            ctx.lineJoin = 'round';             
            ctx.setLineDash([10, 5]); 
            ctx.strokeRect(
            Math.max(0, Math.min(tx, 760)), 
            Math.max(0, Math.min(ty, 560)), 40, 40);
        }

        if (this.bonusTimer > 0) {
            this.bonusTimer -= 1 / 60;
            const bonusImage = images['bonus100'];
            if (bonusImage && bonusImage.complete) {
                const bonusWidth = 80;
                const bonusHeight = 32;
                ctx.drawImage(
                    bonusImage,
                    this.x + this.size / 2 - bonusWidth / 2,
                    this.y - bonusHeight - 8,
                    bonusWidth,
                    bonusHeight
                );
            } else {
                ctx.fillStyle = 'yellow';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('+100', this.x + this.size / 2, this.y - 10);
            }
        }
    }
}

class Entity {
    constructor(type) {
        this.type = type;
        this.size = 30;
        this.x = Math.random() * (800 - this.size);
        this.y = -this.size;
        this.speed = (type === 'enemy' ? 150 + Math.random() * 150 : 200);
    }
    update(dt, scale, diff) { 
        this.y += this.speed * dt * scale * diff; 
    }
    draw(ctx) {
        const imageKey = this.type === 'enemy' ? 'enemy' : 'heart';
        
        if (images[imageKey] && images[imageKey].complete) {
            ctx.drawImage(images[imageKey], this.x, this.y, this.size, this.size);
        } else {
            ctx.fillStyle = (this.type === 'enemy' ? '#e74c3c' : '#adff0a');
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
}

class LaserLine {
    constructor() {
        this.type = 'laser';
        this.width = 800;
        this.height = 10;
        this.x = 0;
        this.y = -this.height;
        this.speed = 250;
    }
    update(dt, scale, diff) {
        this.y += this.speed * dt * scale * diff;
    }
    draw(ctx) {
        ctx.fillStyle = '#fffb14';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

var player = new Player();