const input = {
    keys: {},
    init() {
        window.addEventListener('keydown', e => {
            if (isUpgradePaused && upgradeReady) {
                if (e.code === 'Digit1') { e.preventDefault(); selectUpgrade('speed'); }
                if (e.code === 'Digit2') { e.preventDefault(); selectUpgrade('slow'); }
                if (e.code === 'Digit3') { e.preventDefault(); selectUpgrade('life'); }
                return;
            }
            
            this.keys[e.code] = true;

            if (e.code === 'Escape') togglePause();
            if (e.code === 'KeyR' && gameOver) resetGame();
            
            if (e.code === 'KeyV') executeSuperAbility();

            if (e.code === 'Space' && !isPaused && !isUpgradePaused && !gameOver && this.isArrowPressed()) {
                executeTeleport();
            }
        });

        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });
    },
    isArrowPressed() {
        return this.keys['ArrowLeft'] || this.keys['ArrowRight'] || this.keys['ArrowUp'] || this.keys['ArrowDown'];
    }
};