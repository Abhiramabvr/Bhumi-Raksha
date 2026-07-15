// GameScene.js - Logic utama: pesawat, obstacle, kontrol, HUD
import { QuestionManager } from '../utils/QuestionManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.questionManager = new QuestionManager();
    }

    init(data) {
        this.difficulty = data.difficulty || 'medium';
        this.questionTime = data.questionTime || 10;
    }

    preload() {
        // Assets already loaded in MenuScene, Phaser cache handles this
    }

    async create() {
        const { width, height } = this.scale;

        // Start background music if not playing (e.g., after Retry)
        const bgm = this.sound.get('bgm');
        if (!bgm) {
            this.sound.play('bgm', { loop: true, volume: 0.65 });
        } else if (!bgm.isPlaying) {
            bgm.play({ loop: true, volume: 0.65 });
        }

        // Start rotor flight sound
        this.rotorSound = this.sound.add('baling_baling', { loop: true, volume: 0.10 });
        this.rotorSound.play();

        // ============ GAME STATE ============
        this.lives = 3;
        this.score = 0;
        this.correctAnswers = 0;
        this.totalQuestionsAsked = 0;
        this.isGameOver = false;
        this.questionActive = false;
        this._paused = false;
        this.bulletsLeft = 5;
        this.gasProjectiles = [];
        this._lastSpeedIncrease = 0;

        // Speed settings per difficulty
        const speedMap = { easy: 220, medium: 300, hard: 400 };
        this.gameSpeed = speedMap[this.difficulty] || 300;
        this.obstacleSpeedMultiplier = 1;

        // ============ SCROLLING BACKGROUND ============
        this.bg1 = this.add.image(0, 0, 'sky').setOrigin(0, 0);
        this.bg2 = this.add.image(0, 0, 'sky').setOrigin(0, 0);
        this._scaleBg(this.bg1, width, height);
        this._scaleBg(this.bg2, width, height);
        this.bg2.x = this.bg1.width * this.bg1.scaleX;

        // Ground line
        const groundGfx = this.add.graphics();
        groundGfx.fillStyle(0x064e3b, 0.6);
        groundGfx.fillRect(0, height - 30, width, 30);
        groundGfx.setDepth(10);

        // ============ PLAYER PLANE ============
        this.player = this.add.image(width * 0.18, height / 2, 'plane')
            .setScale(0.16)
            .setDepth(5);

        // Player bounds
        this.playerMinY = 50;
        this.playerMaxY = height - 60;
        this.playerVY = 0; // vertical velocity

        // ============ OBSTACLE GROUPS ============
        // We use simple arrays for obstacle objects
        this.obstacles = [];
        this.bullets = [];

        // Obstacle spawn timer
        const spawnDelayMap = { easy: 3000, medium: 2200, hard: 1500 };
        this.obstacleTimer = this.time.addEvent({
            delay: spawnDelayMap[this.difficulty] || 2200,
            callback: this._spawnObstacle,
            callbackScope: this,
            repeat: -1
        });

        // ============ INPUT ============
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            p: Phaser.Input.Keyboard.KeyCodes.P
        });

        // Listen to space key for shooting
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.isGameOver || this._paused || this.questionActive) return;
            if (this.bulletsLeft > 0) {
                this.bulletsLeft--;
                this._shootBullet();
                this._updateAmmoHUD();
            }
        });

        // Listen to P key for pause
        this.input.keyboard.on('keydown-P', () => {
            this._togglePause();
        });

        // Touch controls
        this.touchUp = false;
        this.touchDown = false;
        this.touchLeft = false;
        this.touchRight = false;
        this._setupTouchControls(width, height);

        // ============ LOAD QUESTIONS ============
        await this.questionManager.loadQuestions();
        this.questionManager.reset();

        // ============ HUD ============
        this._createHUD(width, height);

        // ============ SCORE TICK ============
        // Add score slowly over time (survival bonus)
        this.scoreTick = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.isGameOver && !this.questionActive && !this._paused) {
                    this._addScore(5);
                }
            },
            repeat: -1
        });

        // Camera fade-in
        this.cameras.main.fadeIn(500);

        // Bind question resolver
        this.onQuestionResolved = this._onQuestionResolved.bind(this);
    }

    _scaleBg(img, width, height) {
        const scaleX = width / img.width;
        const scaleY = height / img.height;
        img.setScale(Math.max(scaleX, scaleY));
    }

    _createHUD(width, height) {
        // HUD background bar
        const hudBg = this.add.graphics().setDepth(20);
        hudBg.fillStyle(0x000000, 0.55);
        hudBg.fillRect(0, 0, width, 48);

        // Lives display
        this.lifeTexts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.text(16 + i * 30, 12, '❤️', {
                fontSize: '22px'
            }).setDepth(21);
            this.lifeTexts.push(heart);
        }

        // Ammo Display
        this.ammoLabel = this.add.text(120, 15, '⚡ LASER: 5/5', {
            fontFamily: "'Courier New', monospace, sans-serif",
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#00ffcc',
            stroke: '#000',
            strokeThickness: 2
        }).setDepth(21);

        // Score
        this.scoreLabel = this.add.text(width / 2, 5, 'SKOR: 0', {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5, 0).setDepth(21);

        // Difficulty badge
        const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
        const diffLabels = { easy: '🌱 MUDAH', medium: '🌤 SEDANG', hard: '🔥 SULIT' };
        this.add.text(width - 10, 5, diffLabels[this.difficulty], {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '16px',
            color: diffColors[this.difficulty] || '#fff',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(1, 0).setDepth(21);

        // PAUSE button
        const pauseBtn = this.add.text(width - 10, 48, '⏸', {
            fontSize: '20px'
        }).setOrigin(1, 1).setDepth(21).setInteractive({ useHandCursor: true });
        pauseBtn.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            this._togglePause();
        });
    }

    _updateAmmoHUD() {
        if (this.ammoLabel) {
            this.ammoLabel.setText(`⚡ LASER: ${this.bulletsLeft}/5`);
            if (this.bulletsLeft === 0) {
                this.ammoLabel.setColor('#ef4444');
            } else {
                this.ammoLabel.setColor('#00ffcc');
            }
        }
    }

    _setupTouchControls(width, height) {
        const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;

        if (isMobile) {
            // Draw clean virtual D-pad for 4-way movement
            // Up Button: D-pad top
            this._createVirtualButton(85, height - 150, 30, '▲', 0x00ffcc, 
                () => { this.touchUp = true; }, 
                () => { this.touchUp = false; }
            );

            // Down Button: D-pad bottom
            this._createVirtualButton(85, height - 50, 30, '▼', 0x00ffcc, 
                () => { this.touchDown = true; }, 
                () => { this.touchDown = false; }
            );

            // Left Button: D-pad left
            this._createVirtualButton(35, height - 100, 30, '◀', 0x00ffcc, 
                () => { this.touchLeft = true; }, 
                () => { this.touchLeft = false; }
            );

            // Right Button: D-pad right
            this._createVirtualButton(135, height - 100, 30, '▶', 0x00ffcc, 
                () => { this.touchRight = true; }, 
                () => { this.touchRight = false; }
            );

            // Shoot Button: bottom-right area
            this._createVirtualButton(width - 95, height - 95, 45, 'TEMBAK', 0xef4444, 
                () => {
                    if (this.isGameOver || this._paused || this.questionActive) return;
                    if (this.bulletsLeft > 0) {
                        this.bulletsLeft--;
                        this._shootBullet();
                        this._updateAmmoHUD();
                    }
                }, 
                null
            );
        } else {
            // Top half = go up, bottom half = go down
            const upZone = this.add.rectangle(0, 52, width, (height - 52) / 2, 0x000000, 0)
                .setOrigin(0, 0).setInteractive({ useHandCursor: false }).setDepth(8);
            const downZone = this.add.rectangle(0, 52 + (height - 52) / 2, width, (height - 52) / 2, 0x000000, 0)
                .setOrigin(0, 0).setInteractive({ useHandCursor: false }).setDepth(8);

            upZone.on('pointerdown', () => { this.touchUp = true; });
            upZone.on('pointerup', () => { this.touchUp = false; });
            upZone.on('pointerout', () => { this.touchUp = false; });
            downZone.on('pointerdown', () => { this.touchDown = true; });
            downZone.on('pointerup', () => { this.touchDown = false; });
            downZone.on('pointerout', () => { this.touchDown = false; });

            // Touch indicator arrows
            this.add.text(30, 70, '▲\nNAIK', {
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: '14px',
                color: 'rgba(255,255,255,0.3)',
                align: 'center'
            }).setDepth(9);

            this.add.text(30, this.scale.height - 80, '▼\nTURUN', {
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: '14px',
                color: 'rgba(255,255,255,0.3)',
                align: 'center'
            }).setDepth(9);
        }
    }

    _createVirtualButton(x, y, radius, label, color, onPress, onRelease) {
        const btn = this.add.graphics().setDepth(22);
        btn.fillStyle(color, 0.4);
        btn.lineStyle(2, color, 0.8);
        btn.fillCircle(x, y, radius);
        btn.strokeCircle(x, y, radius);

        const fontSize = label.length > 2 ? '14px' : '24px';
        const txt = this.add.text(x, y, label, {
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontSize: fontSize,
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(23);

        const hitArea = this.add.circle(x, y, radius, 0x000000, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(24);

        hitArea.on('pointerdown', () => {
            btn.clear();
            btn.fillStyle(color, 0.75);
            btn.lineStyle(3, 0xffffff, 0.95);
            btn.fillCircle(x, y, radius);
            btn.strokeCircle(x, y, radius);
            if (onPress) onPress();
        });

        const releaseHandler = () => {
            btn.clear();
            btn.fillStyle(color, 0.4);
            btn.lineStyle(2, color, 0.8);
            btn.fillCircle(x, y, radius);
            btn.strokeCircle(x, y, radius);
            if (onRelease) onRelease();
        };

        hitArea.on('pointerup', releaseHandler);
        hitArea.on('pointerout', releaseHandler);
        
        return { btn, txt, hitArea };
    }

    _spawnObstacle() {
        if (this.isGameOver || this.questionActive || this._paused) return;
        const { width, height } = this.scale;

        // 40% chance of special obstacle (with question)
        const isSpecial = Math.random() < 0.4;
        const texture = isSpecial ? 'obstacle_cloud' : 'obstacle_factory';
        const spawnY = Phaser.Math.Between(80, height - 80);
        const scale = Phaser.Math.FloatBetween(0.12, 0.2);

        const obs = this.add.image(width + 100, spawnY, texture)
            .setScale(scale)
            .setDepth(4)
            .setTint(isSpecial ? 0xff8844 : 0xffffff);

        // Store obstacle data
        const obsData = {
            img: obs,
            isSpecial,
            triggered: false,
            speed: this.gameSpeed * Phaser.Math.FloatBetween(0.8, 1.2),
            halfW: obs.displayWidth / 2,
            halfH: obs.displayHeight / 2
        };

        if (isSpecial) {
            // Pulsing animation for special obstacles
            this.tweens.add({
                targets: obs,
                alpha: 0.7,
                yoyo: true,
                repeat: -1,
                duration: 500
            });

            // Question mark indicator
            const qMark = this.add.text(obs.x, obs.y - obs.displayHeight / 2 - 15, '❓', {
                fontSize: '18px'
            }).setDepth(6);
            obsData.qMark = qMark;
        } else {
            // Pollution monster fires gas bullets
            obsData.nextFireTime = this.time.now + Phaser.Math.Between(1000, 2000);
        }

        this.obstacles.push(obsData);
    }

    _addScore(amount) {
        this.score += amount;
        this.scoreLabel.setText(`SKOR: ${this.score.toLocaleString('id-ID')}`);

        // Floating score text
        if (amount > 5) {
            const { width } = this.scale;
            const floatTxt = this.add.text(
                this.player.x + 60,
                this.player.y,
                `+${amount}`,
                {
                    fontFamily: "'Segoe UI', Arial, sans-serif",
                    fontSize: '22px',
                    fontStyle: 'bold',
                    color: amount >= 100 ? '#ffd700' : '#86efac',
                    stroke: '#000',
                    strokeThickness: 3
                }
            ).setDepth(30);

            this.tweens.add({
                targets: floatTxt,
                y: floatTxt.y - 60,
                alpha: 0,
                duration: 1200,
                onComplete: () => floatTxt.destroy()
            });
        }
    }

    _loseLife() {
        if (this.isGameOver) return;
        this.lives--;

        // Update HUD hearts
        if (this.lives >= 0 && this.lives < 3) {
            const idx = this.lives;
            this.tweens.add({
                targets: this.lifeTexts[idx],
                alpha: 0.2,
                scaleX: 0.6,
                scaleY: 0.6,
                duration: 400
            });
        }

        // Screen flash red
        const flash = this.add.graphics().setDepth(50);
        flash.fillStyle(0xff0000, 0.35);
        flash.fillRect(0, 0, this.scale.width, this.scale.height);
        this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });

        // Plane shake animation
        this.tweens.add({
            targets: this.player,
            x: this.player.x + 15,
            yoyo: true,
            repeat: 3,
            duration: 60
        });

        if (this.lives <= 0) {
            this._gameOver();
        }
    }

    _shootBullet() {
        const { width } = this.scale;
        // Play laser shot sound
        this.sound.play('laser', { volume: 0.65 });

        // Draw bullet as graphics
        const bullet = this.add.graphics().setDepth(6);
        bullet.fillStyle(0x86efac, 1);
        bullet.fillCircle(0, 0, 7);
        bullet.x = this.player.x + this.player.displayWidth / 2;
        bullet.y = this.player.y;

        // Glowing effect
        const glow = this.add.graphics().setDepth(5);
        glow.fillStyle(0x4ade80, 0.3);
        glow.fillCircle(0, 0, 14);
        glow.x = bullet.x;
        glow.y = bullet.y;

        this.bullets.push({ gfx: bullet, glow, vy: 0, active: true });
        // Animate glow
        this.tweens.add({ targets: glow, alpha: 0, duration: 600, onComplete: () => glow.destroy() });
    }

    _onQuestionResolved(isCorrect, gotBonus) {
        this.questionActive = false;

        if (isCorrect) {
            this.correctAnswers++;
            let points = 100;
            if (gotBonus) points += 50;
            this._addScore(points);
            this.bulletsLeft = 5; // reload bullets
            this._updateAmmoHUD();
            this._shootBullet();
        }
        // If wrong, the special obstacle continues to move (player must dodge)
        // Mark that we no longer need to handle this obstacle
    }

    _triggerQuestion(obsData) {
        if (this.questionActive) return;
        obsData.triggered = true;
        this.questionActive = true;
        this.totalQuestionsAsked++;

        const question = this.questionManager.getRandomQuestion();
        const { shuffledOptions, newCorrectIndex } = this.questionManager.getShuffledOptions(question);

        // Pause obstacle movement during question
        this.scene.launch('QuestionScene', {
            question,
            questionTime: this.questionTime,
            shuffledOptions,
            correctIndex: newCorrectIndex,
            onAnswer: null // handled via scene communication
        });
    }

    _gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        // Stop sounds
        const bgm = this.sound.get('bgm');
        if (bgm) bgm.stop();
        if (this.rotorSound) this.rotorSound.stop();

        // Play game over sound
        this.sound.play('game_over', { volume: 0.6 });

        this.obstacleTimer.remove();
        this.scoreTick.remove();
 
         // Stop all tweens on obstacles
         this.obstacles.forEach(o => {
             this.tweens.killTweensOf(o.img);
         });
 
         // Destroy gas projectiles
         this.gasProjectiles.forEach(p => p.gfx.destroy());
         this.gasProjectiles = [];
 
         // Flash screen then go to score
         this.cameras.main.flash(500, 200, 0, 0);
         this.time.delayedCall(800, () => {
             this.cameras.main.fadeOut(500, 0, 0, 0);
             this.time.delayedCall(500, () => {
                 this.scene.stop('QuestionScene');
                 this.scene.start('ScoreScene', {
                     score: this.score,
                     correctAnswers: this.correctAnswers,
                     totalQuestions: this.totalQuestionsAsked,
                     difficulty: this.difficulty,
                     questionTime: this.questionTime
                 });
             });
         });
     }
 
     _togglePause() {
         if (this.isGameOver) return;
         
         if (this._paused) {
             this._paused = false;
             if (this._pauseText) { this._pauseText.destroy(); this._pauseText = null; }
             if (this._pauseOverlay) { this._pauseOverlay.destroy(); this._pauseOverlay = null; }
             this.obstacleTimer.paused = false;
             this.scoreTick.paused = false;

             // Resume rotor sound
             if (this.rotorSound && this.rotorSound.isPaused) {
                 this.rotorSound.resume();
             }
         } else {
             this._paused = true;
             this.obstacleTimer.paused = true;
             this.scoreTick.paused = true;

             // Pause rotor sound
             if (this.rotorSound && this.rotorSound.isPlaying) {
                 this.rotorSound.pause();
             }
             
             const { width, height } = this.scale;
             this._pauseOverlay = this.add.graphics().setDepth(100);
             this._pauseOverlay.fillStyle(0x000000, 0.75);
             this._pauseOverlay.fillRect(0, 0, width, height);
 
             this._pauseText = this.add.text(width / 2, height / 2, '⏸ JEDA\n\nTekan P atau Klik Layar untuk Melanjutkan', {
                 fontFamily: "Courier New, monospace, sans-serif",
                 fontSize: '24px',
                 fontStyle: 'bold',
                 color: '#00ffcc',
                 align: 'center'
             }).setOrigin(0.5).setDepth(101);
 
             // Small delay to prevent catching the click that triggered pause
             this.time.delayedCall(150, () => {
                 if (this._paused) {
                     this.input.once('pointerdown', this._resumeFromClick, this);
                 }
             });
         }
     }

    _resumeFromClick() {
        if (this._paused) {
            this._togglePause();
        }
    }

    update(time, delta) {
        if (this.isGameOver || this._paused) return;
        const dt = delta / 1000;
        const { width, height } = this.scale;

        // ============ SCROLLING BACKGROUND ============
        const bgMoveSpeed = this.gameSpeed * 0.35;
        const bgScaledW = this.bg1.width * this.bg1.scaleX;
        this.bg1.x -= bgMoveSpeed * dt;
        this.bg2.x -= bgMoveSpeed * dt;
        if (this.bg1.x + bgScaledW <= 0) this.bg1.x = this.bg2.x + bgScaledW;
        if (this.bg2.x + bgScaledW <= 0) this.bg2.x = this.bg1.x + bgScaledW;

        // ============ PLAYER MOVEMENT ============
        if (!this.questionActive) {
            const moveSpeed = 300;
            
            // Vertical movement
            const goingUp = this.keys.up.isDown || this.keys.w.isDown || this.touchUp;
            const goingDown = this.keys.down.isDown || this.keys.s.isDown || this.touchDown;

            if (goingUp) {
                this.playerVY = -moveSpeed;
                this.player.setAngle(-12);
            } else if (goingDown) {
                this.playerVY = moveSpeed;
                this.player.setAngle(12);
            } else {
                this.playerVY *= 0.85; // damping - hover effect
                this.player.setAngle(0);
            }

            this.player.y += this.playerVY * dt;
            this.player.y = Phaser.Math.Clamp(this.player.y, this.playerMinY, this.playerMaxY);

            // Horizontal movement (Maju & Mundur)
            const goingLeft = this.keys.left.isDown || this.keys.a.isDown || this.touchLeft;
            const goingRight = this.keys.right.isDown || this.keys.d.isDown || this.touchRight;

            if (goingLeft) {
                this.player.x -= moveSpeed * dt;
            } else if (goingRight) {
                this.player.x += moveSpeed * dt;
            }

            // Bound player horizontally within screen limits (e.g. 50 to width - 50)
            this.player.x = Phaser.Math.Clamp(this.player.x, 50, width - 50);

            // Gentle bob animation when hovering
            if (!goingUp && !goingDown) {
                this.player.y += Math.sin(time / 600) * 0.4;
            }
        }

        // ============ BULLETS ============
        const bulletSpeed = 700;
        this.bullets = this.bullets.filter(b => {
            if (!b.active) return false;
            b.gfx.x += bulletSpeed * dt;
            if (b.gfx.x > width + 50) {
                b.gfx.destroy();
                return false;
            }
            return true;
        });

        // ============ GAS PROJECTILES ============
        const gasSpeed = this.gameSpeed * 1.5;
        this.gasProjectiles = this.gasProjectiles.filter(p => {
            p.gfx.x -= gasSpeed * dt;

            // check collision with player
            if (!this.questionActive) {
                const dx = Math.abs(this.player.x - p.gfx.x);
                const dy = Math.abs(this.player.y - p.gfx.y);
                const playerHW = this.player.displayWidth * 0.35;
                const playerHH = this.player.displayHeight * 0.35;
                if (dx < playerHW + 8 && dy < playerHH + 8) {
                    this._explodeObstacle(p.gfx.x, p.gfx.y);
                    p.gfx.destroy();
                    this._loseLife();
                    return false;
                }
            }

            if (p.gfx.x < -50) {
                p.gfx.destroy();
                return false;
            }
            return true;
        });

        // ============ OBSTACLES ============
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            const obsSpeed = this.questionActive ? this.gameSpeed * 0.15 : o.speed;
            o.img.x -= obsSpeed * dt;

            // Move question mark with obstacle
            if (o.qMark) {
                o.qMark.x = o.img.x;
                o.qMark.y = o.img.y - o.img.displayHeight / 2 - 15;
            }

            // Let the pollution monster shoot gas projectiles
            if (!o.isSpecial && this.time.now > o.nextFireTime && o.img.x > width * 0.25 && o.img.x < width + 50) {
                o.nextFireTime = this.time.now + Phaser.Math.Between(1500, 3000);
                
                const gasGfx = this.add.graphics().setDepth(5);
                gasGfx.fillStyle(0x3a3a3a, 0.95);
                gasGfx.fillCircle(0, 0, 9);
                gasGfx.fillStyle(0xef4444, 0.7);
                gasGfx.fillCircle(0, 0, 4);
                gasGfx.x = o.img.x - o.halfW;
                gasGfx.y = o.img.y;
                
                this.gasProjectiles.push({ gfx: gasGfx });
            }

            // Check bullet collision
            let destroyedByBullet = false;
            for (let b = this.bullets.length - 1; b >= 0; b--) {
                const bullet = this.bullets[b];
                const dx = Math.abs(bullet.gfx.x - o.img.x);
                const dy = Math.abs(bullet.gfx.y - o.img.y);
                if (dx < o.halfW + 10 && dy < o.halfH + 10) {
                    // Hit!
                    this._explodeObstacle(o.img.x, o.img.y);
                    bullet.gfx.destroy();
                    this.bullets[b].active = false;
                    destroyedByBullet = true;
                    break;
                }
            }

            if (destroyedByBullet) {
                o.img.destroy();
                o.qMark?.destroy();
                this.obstacles.splice(i, 1);
                continue;
            }

            // Check if special obstacle is in trigger zone (center of screen ~30%)
            if (o.isSpecial && !o.triggered && o.img.x < this.scale.width * 0.65) {
                this._triggerQuestion(o);
            }

            // Check player collision (only if not triggered yet or question resolved wrong)
            if (!this.questionActive) {
                const px = this.player.x;
                const py = this.player.y;
                const playerHW = this.player.displayWidth * 0.35;
                const playerHH = this.player.displayHeight * 0.35;

                const dx = Math.abs(px - o.img.x);
                const dy = Math.abs(py - o.img.y);
                if (dx < playerHW + o.halfW * 0.6 && dy < playerHH + o.halfH * 0.6) {
                    // Collision!
                    this._explodeObstacle(o.img.x, o.img.y);
                    o.img.destroy();
                    o.qMark?.destroy();
                    this.obstacles.splice(i, 1);
                    this._loseLife();
                    continue;
                }
            }

            // Off screen - remove
            if (o.img.x < -200) {
                o.img.destroy();
                o.qMark?.destroy();
                this.obstacles.splice(i, 1);
            }
        }

        // Increase speed over time (every 30 seconds)
        if (Math.floor(time / 30000) > this._lastSpeedIncrease) {
            this._lastSpeedIncrease = Math.floor(time / 30000);
            this.gameSpeed = Math.min(this.gameSpeed + 20, 700);
        }
    }

    _explodeObstacle(x, y) {
        // Simple particle explosion with graphics
        for (let i = 0; i < 8; i++) {
            const particle = this.add.graphics().setDepth(15);
            particle.fillStyle(Phaser.Math.RND.pick([0xff8c00, 0xff4444, 0xffff00, 0x4ade80]), 1);
            particle.fillCircle(0, 0, Phaser.Math.Between(4, 10));
            particle.x = x;
            particle.y = y;
            const angle = (i / 8) * Math.PI * 2;
            const speed = Phaser.Math.Between(60, 150);
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: Phaser.Math.Between(400, 700),
                onComplete: () => particle.destroy()
            });
        }

        // Flash
        const flash = this.add.graphics().setDepth(14);
        flash.fillStyle(0xffffff, 0.6);
        flash.fillCircle(x, y, 40);
        this.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: () => flash.destroy() });
    }
}
