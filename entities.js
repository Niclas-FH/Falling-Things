const images = {};
function loadImages() {
    const imageFiles = {
        'enemy': 'images/enemy.png',
        'heart': 'images/heart.png',
        'background': 'images/background.png',
        'bonus100': 'images/100.png',
        'tnt': 'images/tnt.png'
    };
    
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
    let currentDirection = '';
    
    const oldX = this.x;
    const oldY = this.y;
    
    if (input.keys['KeyA']) { this.x -= playerSpeed * dt; currentDirection = 'Left'; }
    if (input.keys['KeyD']) { this.x += playerSpeed * dt; currentDirection = 'Right'; }
    if (input.keys['KeyW']) { this.y -= playerSpeed * dt; currentDirection = 'Up'; }
    if (input.keys['KeyS']) { this.y += playerSpeed * dt; currentDirection = 'Down'; }
    
    this.x = Math.max(0, Math.min(this.x, 800 - this.size));
    this.y = Math.max(0, Math.min(this.y, 600 - this.size));
    
    const trulyMoved = (this.x !== oldX || this.y !== oldY);
    
    if (!trulyMoved && !this.isSlowActive) {
        this.lastDirection = '';
    } else if (trulyMoved) {
        this.lastDirection = currentDirection;
    }
    
    if (trulyMoved && energy < 100) {
        energy += 10 * dt;
        if (energy > 100) energy = 100;
    }
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

class BombEffect {
    constructor(x, y) {
        const size = player ? player.size : 40;
        this.x = Math.max(0, Math.min(x, 800 - size));
        this.y = Math.max(0, Math.min(y, 600 - size));
        this.startTime = performance.now();
        this.duration = 3000;
        this.frameDuration = 333;
        this.triggered = false;
        this.size = size;
    }

    draw(ctx) {
        const image = images['tnt'];
        if (image && image.complete) {
            const frameIndex = Math.floor((performance.now() - this.startTime) / this.frameDuration) % 3;
            const frameWidth = Math.floor(image.width / 3);
            ctx.drawImage(
                image,
                frameIndex * frameWidth,
                0,
                frameWidth,
                image.height,
                this.x,
                this.y,
                this.size,
                this.size
            );
        } else {
            ctx.fillStyle = '#ff3d00';
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
}

var player = new Player();