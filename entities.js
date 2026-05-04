const images = {};
function loadImages() {
    const imageFiles = {
        'player': 'images/player.png',
        'enemy': 'images/enemy.png',
        'heart': 'images/heart.png'
    };
    
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
    }
    update(dt) {
        let moved = false;
        if (input.keys['KeyA']) { this.x -= playerSpeed * dt; moved = true; }
        if (input.keys['KeyD']) { this.x += playerSpeed * dt; moved = true; }
        if (input.keys['KeyW']) { this.y -= playerSpeed * dt; moved = true; }
        if (input.keys['KeyS']) { this.y += playerSpeed * dt; moved = true; }
        
        if (moved && energy < 100) energy += 10 * dt;
        
        this.x = Math.max(0, Math.min(this.x, 800 - this.size));
        this.y = Math.max(0, Math.min(this.y, 600 - this.size));
    }
    draw(ctx) {
        if (images['player'] && images['player'].complete) {
            ctx.drawImage(images['player'], this.x, this.y, this.size, this.size);
        } else {
            ctx.fillStyle = '#3498db';
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
        
        if (input.isArrowPressed() && energy >= 40) {
            let tx = this.x, ty = this.y;
            if (input.keys['ArrowLeft']) tx -= 130;
            if (input.keys['ArrowRight']) tx += 130;
            if (input.keys['ArrowUp']) ty -= 130;
            if (input.keys['ArrowDown']) ty += 130;
            ctx.fillStyle = 'rgba(46, 204, 113, 1)';
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(Math.max(0, Math.min(tx, 760)), Math.max(0, Math.min(ty, 560)), 40, 40);
            ctx.setLineDash([]);
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
        ctx.fillStyle = '#ff1493';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

var player = new Player();