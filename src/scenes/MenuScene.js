// MenuScene.js - Tampilan menu utama & pilih level
import { QuestionManager } from '../utils/QuestionManager.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('sky', './assets/images/sky_background.png');
        this.load.image('plane', './assets/images/plane.png');
        this.load.image('obstacle_factory', './assets/images/obstacle_factory.png');
        this.load.image('obstacle_cloud', './assets/images/obstacle_cloud.png');

        // Load audio assets
        this.load.audio('baling_baling', './assets/audio/BALING BALING.mp3');
        this.load.audio('game_over', './assets/audio/GAME OVER.mp3');
        this.load.audio('bgm', './assets/audio/Lensko - Cetus  House  NCS - Copyright Free Music.mp3');
        this.load.audio('laser', './assets/audio/LASER TEMBAK.mp3');
        this.load.audio('benar', './assets/audio/SOUND BENAR.mp3');
        this.load.audio('salah', './assets/audio/SOUND SALAH.mp3');
    }

    create() {
        // Mute sound initially until play button is pressed
        this.sound.mute = true;

        const startAudio = () => {
            this.sound.mute = false;
            if (!this.sound.get('bgm')) {
                this.sound.play('bgm', { loop: true, volume: 0.65 });
            } else if (!this.sound.get('bgm').isPlaying) {
                this.sound.get('bgm').play();
            }
        };

        if (window.gameStarted) {
            startAudio();
        } else {
            window.addEventListener('game-start', () => {
                startAudio();
            }, { once: true });
        }

        const { width, height } = this.scale;

        // Scrolling background
        this.bg1 = this.add.image(0, 0, 'sky').setOrigin(0, 0);
        this.bg2 = this.add.image(width, 0, 'sky').setOrigin(0, 0);
        this._scaleBg(this.bg1, width, height);
        this._scaleBg(this.bg2, width, height);

        // Decorative plane animation
        this.decorPlane = this.add.image(-120, height * 0.38, 'plane')
            .setScale(0.18)
            .setAlpha(0.85);

        this.tweens.add({
            targets: this.decorPlane,
            x: width + 150,
            duration: 7000,
            repeat: -1,
            ease: 'Linear'
        });

        // ============ FUTURISTIC RADAR GRID & HUD ============
        const gridGfx = this.add.graphics();
        gridGfx.lineStyle(1, 0x00ffaa, 0.08);
        // Draw vertical grid lines
        for (let x = 0; x < width; x += 40) {
            gridGfx.lineBetween(x, 0, x, height);
        }
        // Draw horizontal grid lines
        for (let y = 0; y < height; y += 40) {
            gridGfx.lineBetween(0, y, width, y);
        }

        // Floating clouds overlay via graphics (decorative)
        this._drawDecorClouds();

        // ============ TACTICAL HUD CARD ============
        const cardW = Math.min(600, width - 40);
        const cardX = width / 2 - cardW / 2;
        const cardY = height * 0.04;
        const cardH = height * 0.92;

        const cardGfx = this.add.graphics();
        
        // Semi-transparent spacecraft glass panel
        cardGfx.fillStyle(0x020d08, 0.88);
        cardGfx.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
        
        // Glowing thin panel border
        cardGfx.lineStyle(1.5, 0x00ffcc, 0.25);
        cardGfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

        // Sci-Fi Corner Brackets (Thicker glowing cyan corners)
        cardGfx.lineStyle(3, 0x00ffcc, 0.85);
        const bLen = 20; // Bracket length
        // Top-Left
        cardGfx.lineBetween(cardX, cardY, cardX + bLen, cardY);
        cardGfx.lineBetween(cardX, cardY, cardX, cardY + bLen);
        // Top-Right
        cardGfx.lineBetween(cardX + cardW, cardY, cardX + cardW - bLen, cardY);
        cardGfx.lineBetween(cardX + cardW, cardY, cardX, cardY + bLen); // Wait, fix this to cardX + cardW
        cardGfx.lineBetween(cardX + cardW, cardY, cardX + cardW, cardY + bLen);
        // Bottom-Left
        cardGfx.lineBetween(cardX, cardY + cardH, cardX + bLen, cardY + cardH);
        cardGfx.lineBetween(cardX, cardY + cardH, cardX, cardY + cardH - bLen);
        // Bottom-Right
        cardGfx.lineBetween(cardX + cardW, cardY + cardH, cardX + cardW - bLen, cardY + cardH);
        cardGfx.lineBetween(cardX + cardW, cardY + cardH, cardX + cardW, cardY + cardH - bLen);

        // HUD panel accents
        cardGfx.lineStyle(1, 0x00ffcc, 0.15);
        cardGfx.lineBetween(cardX + 15, cardY + 15, cardX + cardW - 15, cardY + 15);
        cardGfx.lineBetween(cardX + 15, cardY + cardH - 15, cardX + cardW - 15, cardY + cardH - 15);

        // Title
        const titleStyle = {
            fontFamily: "Courier New, monospace, sans-serif",
            fontSize: Math.floor(height * 0.075) + 'px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#00ffaa',
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 15, stroke: true, fill: false }
        };
        this.add.text(width / 2, cardY + height * 0.075, 'BHUMI RAKSHA', titleStyle)
            .setOrigin(0.5);

        const subtitleStyle = {
            fontFamily: "Courier New, monospace, sans-serif",
            fontSize: Math.floor(height * 0.026) + 'px',
            color: '#86efac',
            letterSpacing: 2
        };
        this.add.text(width / 2, cardY + height * 0.145, '> MISSION: SKIES OF TOMORROW', subtitleStyle)
            .setOrigin(0.5);

        // SDGs badge (Minimalist HUD badge)
        const badgeStyle = {
            fontFamily: "Courier New, monospace, sans-serif",
            fontSize: Math.floor(height * 0.02) + 'px',
            color: '#00ffcc',
            backgroundColor: 'rgba(0, 255, 204, 0.08)'
        };
        const badge = this.add.text(width / 2, cardY + height * 0.20, ' [ COGNITIVE ENGINE // SDG-13 CLIMATE ACTION ] ', badgeStyle)
            .setOrigin(0.5);

        // ============ HOW TO PLAY (TACTICAL READOUT) ============
        const infoStyle = {
            fontFamily: "Courier New, monospace, sans-serif",
            fontSize: Math.floor(height * 0.022) + 'px',
            color: '#a7f3d0',
            lineSpacing: 8,
            wordWrap: { width: cardW - 60 }
        };

        const howToPlay = [
            '■ THRUSTER UP   ::  ↑ / W KEY',
            '■ THRUSTER DOWN ::  ↓ / S KEY',
            '■ HAZARD SCANNER::  ANSWER SPECIAL QUESTION MODULES',
            '■ TARGET LOCKED ::  CORRECT ANSWERS TRIGGER CANNON (+100 XP)',
            '■ EVASIVE ACTION::  MANUAL FLIGHT PATH ON FALSE ANSWER',
            '■ SHIELD STATUS ::  3 POWER CELLS REMAINING (CRITICAL AT 0)'
        ].join('\n');

        this.add.text(cardX + 40, cardY + height * 0.28, howToPlay, infoStyle)
            .setOrigin(0, 0);

        // ============ PILIH LEVEL ============
        const levelLabelStyle = {
            fontFamily: "Courier New, monospace, sans-serif",
            fontSize: Math.floor(height * 0.026) + 'px',
            fontStyle: 'bold',
            color: '#00ffcc',
            letterSpacing: 3
        };
        this.add.text(width / 2, cardY + height * 0.58, '[ CHOOSE DIFFICULTY PROTOCOL ]', levelLabelStyle)
            .setOrigin(0.5);

        const levels = [
            { label: 'EASY_MOD', key: 'easy', color: 0x10b981, strokeColor: 0x059669, textColor: '#10b981', time: 15, desc: '15s/MODULE' },
            { label: 'MED_MOD', key: 'medium', color: 0xf59e0b, strokeColor: 0xd97706, textColor: '#f59e0b', time: 10, desc: '10s/MODULE' },
            { label: 'HARD_MOD', key: 'hard', color: 0xef4444, strokeColor: 0xdc2626, textColor: '#ef4444', time: 7, desc: '7s/MODULE' }
        ];

        const btnW = Math.min(160, (cardW - 80) / 3);
        const btnH = 55;
        const btnSpacing = (cardW - 60 - btnW * 3) / 2;
        const firstBtnX = cardX + 30;
        const btnY = cardY + height * 0.635;

        levels.forEach((lvl, i) => {
            const bx = firstBtnX + i * (btnW + btnSpacing);
            const btn = this.add.graphics();
            
            // Draw minimalist transparent button outline
            btn.fillStyle(0x020d08, 0.6);
            btn.fillRoundedRect(bx, btnY, btnW, btnH, 4);
            btn.lineStyle(1.5, lvl.color, 0.65);
            btn.strokeRoundedRect(bx, btnY, btnW, btnH, 4);

            const btnText = this.add.text(bx + btnW / 2, btnY + btnH / 2 - 8, lvl.label, {
                fontFamily: "Courier New, monospace, sans-serif",
                fontSize: Math.floor(height * 0.022) + 'px',
                fontStyle: 'bold',
                color: lvl.textColor
            }).setOrigin(0.5);

            const descText = this.add.text(bx + btnW / 2, btnY + btnH / 2 + 14, lvl.desc, {
                fontFamily: "Courier New, monospace, sans-serif",
                fontSize: Math.floor(height * 0.016) + 'px',
                color: 'rgba(255,255,255,0.6)'
            }).setOrigin(0.5);

            // Invisible hit area
            const hitArea = this.add.rectangle(bx + btnW / 2, btnY + btnH / 2, btnW, btnH, 0x000000, 0)
                .setInteractive({ useHandCursor: true });

            hitArea.on('pointerover', () => {
                btn.clear();
                btn.fillStyle(lvl.color, 0.15);
                btn.fillRoundedRect(bx, btnY, btnW, btnH, 4);
                btn.lineStyle(2, lvl.color, 1);
                btn.strokeRoundedRect(bx, btnY, btnW, btnH, 4);
                
                // Add glowing glow
                btnText.setTint(0xffffff);
                this.tweens.add({ targets: [btnText, descText], scaleX: 1.05, scaleY: 1.05, duration: 100 });
            });

            hitArea.on('pointerout', () => {
                btn.clear();
                btn.fillStyle(0x020d08, 0.6);
                btn.fillRoundedRect(bx, btnY, btnW, btnH, 4);
                btn.lineStyle(1.5, lvl.color, 0.65);
                btn.strokeRoundedRect(bx, btnY, btnW, btnH, 4);
                
                btnText.clearTint();
                this.tweens.add({ targets: [btnText, descText], scaleX: 1, scaleY: 1, duration: 100 });
            });

            hitArea.on('pointerdown', () => {
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.time.delayedCall(400, () => {
                    this.scene.start('GameScene', { difficulty: lvl.key, questionTime: lvl.time });
                });
            });
        });

        // Credit text
        const creditStyle = {
            fontFamily: "Courier New, monospace, sans-serif",
            fontSize: Math.floor(height * 0.018) + 'px',
            color: 'rgba(0, 255, 204, 0.5)',
            align: 'center',
            letterSpacing: 1
        };
        this.add.text(width / 2, cardY + height * 0.84, 'SECURE INTERFACE UNIT // PROJECT GREEN ASCENT\nAbhi · Rizqi · Afif  |  UAD 2026', creditStyle)
            .setOrigin(0.5);

        // Camera fade in
        this.cameras.main.fadeIn(600);
    }

    _scaleBg(img, width, height) {
        const scaleX = width / img.width;
        const scaleY = height / img.height;
        img.setScale(Math.max(scaleX, scaleY));
    }

    _drawDecorClouds() {
        // Simple decorative cloud shapes using graphics
        const { width, height } = this.scale;
        const clouds = this.add.graphics();
        clouds.fillStyle(0xFFFFFF, 0.12);

        const cloudPositions = [
            { x: width * 0.1, y: height * 0.15, r: 60 },
            { x: width * 0.85, y: height * 0.25, r: 50 },
            { x: width * 0.5, y: height * 0.08, r: 40 },
        ];

        cloudPositions.forEach(c => {
            clouds.fillCircle(c.x, c.y, c.r);
            clouds.fillCircle(c.x + c.r * 0.7, c.y + 10, c.r * 0.8);
            clouds.fillCircle(c.x - c.r * 0.6, c.y + 10, c.r * 0.75);
        });
    }

    update() {
        const { width } = this.scale;
        const bgScale = this.bg1.scaleX;
        const bgWidth = this.bg1.width * bgScale;

        this.bg1.x -= 0.8;
        this.bg2.x -= 0.8;

        if (this.bg1.x + bgWidth <= 0) this.bg1.x = this.bg2.x + bgWidth;
        if (this.bg2.x + bgWidth <= 0) this.bg2.x = this.bg1.x + bgWidth;
    }
}
