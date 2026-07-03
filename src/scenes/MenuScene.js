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
    }

    create() {
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

        // Floating clouds overlay via graphics (decorative)
        this._drawDecorClouds();

        // ============ TITLE CARD ============
        // Semi-transparent card background
        const cardW = Math.min(600, width - 40);
        const cardX = width / 2 - cardW / 2;
        const cardY = height * 0.05;

        const cardGfx = this.add.graphics();
        cardGfx.fillStyle(0x000000, 0.45);
        cardGfx.fillRoundedRect(cardX, cardY, cardW, height * 0.88, 24);

        // Title
        const titleStyle = {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.075) + 'px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#1a6b3a',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 3, color: '#000', blur: 8, fill: true }
        };
        this.add.text(width / 2, cardY + height * 0.085, 'BHUMI RAKSHA', titleStyle)
            .setOrigin(0.5);

        const subtitleStyle = {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.033) + 'px',
            color: '#A8FFD4',
            stroke: '#000',
            strokeThickness: 2
        };
        this.add.text(width / 2, cardY + height * 0.165, '✈  Skies of Tomorrow  ✈', subtitleStyle)
            .setOrigin(0.5);

        // SDGs badge
        const badgeStyle = {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.022) + 'px',
            color: '#FFE066',
            stroke: '#7a5c00',
            strokeThickness: 2
        };
        this.add.text(width / 2, cardY + height * 0.225, '🌍  SDGs Goal 13: Climate Action  🌍', badgeStyle)
            .setOrigin(0.5);

        // Divider line
        const divGfx = this.add.graphics();
        divGfx.lineStyle(2, 0x4dd980, 0.6);
        divGfx.lineBetween(cardX + 30, cardY + height * 0.265, cardX + cardW - 30, cardY + height * 0.265);

        // ============ HOW TO PLAY ============
        const infoStyle = {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.024) + 'px',
            color: '#DDFFF0',
            lineSpacing: 8,
            wordWrap: { width: cardW - 60 }
        };

        const howToPlay = [
            '🎮  ↑ / W  →  Pesawat Naik',
            '🎮  ↓ / S  →  Pesawat Turun',
            '❓  Obstacle Khusus  →  Jawab Pertanyaan!',
            '✅  Jawab Benar  →  Tembak & +100 Skor',
            '❌  Jawab Salah  →  Hindari Manual!',
            '❤️  3 Nyawa  —  Game Over jika habis'
        ].join('\n');

        this.add.text(width / 2, cardY + height * 0.37, howToPlay, infoStyle)
            .setOrigin(0.5, 0);

        // ============ PILIH LEVEL ============
        const levelLabelStyle = {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.03) + 'px',
            fontStyle: 'bold',
            color: '#FFE066'
        };
        this.add.text(width / 2, cardY + height * 0.595, 'PILIH LEVEL KESULITAN', levelLabelStyle)
            .setOrigin(0.5);

        const levels = [
            { label: '🌱  MUDAH', key: 'easy', color: 0x22c55e, textColor: '#fff', time: 15, desc: '15 detik / soal' },
            { label: '🌤  SEDANG', key: 'medium', color: 0xf59e0b, textColor: '#fff', time: 10, desc: '10 detik / soal' },
            { label: '🔥  SULIT', key: 'hard', color: 0xef4444, textColor: '#fff', time: 7, desc: '7 detik / soal' }
        ];

        const btnW = Math.min(160, (cardW - 80) / 3);
        const btnH = 55;
        const btnSpacing = (cardW - 60 - btnW * 3) / 2;
        const firstBtnX = cardX + 30;
        const btnY = cardY + height * 0.65;

        levels.forEach((lvl, i) => {
            const bx = firstBtnX + i * (btnW + btnSpacing);
            const btn = this.add.graphics();
            btn.fillStyle(lvl.color, 1);
            btn.fillRoundedRect(bx, btnY, btnW, btnH, 12);

            const btnText = this.add.text(bx + btnW / 2, btnY + btnH / 2 - 8, lvl.label, {
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: Math.floor(height * 0.025) + 'px',
                fontStyle: 'bold',
                color: lvl.textColor
            }).setOrigin(0.5);

            const descText = this.add.text(bx + btnW / 2, btnY + btnH / 2 + 14, lvl.desc, {
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: Math.floor(height * 0.018) + 'px',
                color: 'rgba(255,255,255,0.8)'
            }).setOrigin(0.5);

            // Invisible hit area
            const hitArea = this.add.rectangle(bx + btnW / 2, btnY + btnH / 2, btnW, btnH, 0x000000, 0)
                .setInteractive({ useHandCursor: true });

            hitArea.on('pointerover', () => {
                btn.clear();
                btn.fillStyle(lvl.color, 0.8);
                btn.fillRoundedRect(bx, btnY, btnW, btnH, 12);
                btn.lineStyle(3, 0xFFFFFF, 0.8);
                btn.strokeRoundedRect(bx, btnY, btnW, btnH, 12);
                this.tweens.add({ targets: [btnText, descText], scaleX: 1.05, scaleY: 1.05, duration: 100 });
            });

            hitArea.on('pointerout', () => {
                btn.clear();
                btn.fillStyle(lvl.color, 1);
                btn.fillRoundedRect(bx, btnY, btnW, btnH, 12);
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
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.019) + 'px',
            color: 'rgba(200,255,220,0.7)',
            align: 'center'
        };
        this.add.text(width / 2, cardY + height * 0.82, 'PROJECT GREEN ASCENT\nAbhi · Rizqi · Afif  |  UAD 2026', creditStyle)
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
