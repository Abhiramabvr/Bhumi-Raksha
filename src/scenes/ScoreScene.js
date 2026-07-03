// ScoreScene.js - Tampilan skor akhir & retry
export class ScoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ScoreScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.correctAnswers = data.correctAnswers || 0;
        this.totalQuestions = data.totalQuestions || 0;
        this.difficulty = data.difficulty || 'easy';
        this.questionTime = data.questionTime || 15;
    }

    create() {
        const { width, height } = this.scale;

        // Background gradient via graphics
        const bgGfx = this.add.graphics();
        bgGfx.fillGradientStyle(0x071a0f, 0x071a0f, 0x0d3320, 0x0d3320, 1);
        bgGfx.fillRect(0, 0, width, height);

        // Particle-like stars background
        this._drawStars();

        // Score card
        const cardW = Math.min(560, width - 40);
        const cardH = Math.min(520, height - 60);
        const cardX = (width - cardW) / 2;
        const cardY = (height - cardH) / 2;

        const card = this.add.graphics();
        card.fillStyle(0x0a1f14, 0.96);
        card.fillRoundedRect(cardX, cardY, cardW, cardH, 24);
        card.lineStyle(3, 0x4ade80, 0.9);
        card.strokeRoundedRect(cardX, cardY, cardW, cardH, 24);

        // Top gradient accent
        const topAccent = this.add.graphics();
        topAccent.fillGradientStyle(0x16a34a, 0x16a34a, 0x22c55e, 0x22c55e, 1);
        topAccent.fillRoundedRect(cardX, cardY, cardW, 10, { tl: 24, tr: 24, bl: 0, br: 0 });

        // Determine rank
        const accuracy = this.totalQuestions > 0
            ? Math.round((this.correctAnswers / this.totalQuestions) * 100)
            : 0;

        let rank, rankColor, rankEmoji;
        if (accuracy >= 90) { rank = 'Pahlawan Iklim!'; rankColor = '#ffd700'; rankEmoji = '🏆'; }
        else if (accuracy >= 70) { rank = 'Pejuang Hijau'; rankColor = '#4ade80'; rankEmoji = '🌿'; }
        else if (accuracy >= 50) { rank = 'Aktivis Muda'; rankColor = '#60a5fa'; rankEmoji = '🌱'; }
        else { rank = 'Terus Belajar!'; rankColor = '#f87171'; rankEmoji = '📚'; }

        // Rank emoji (big)
        this.add.text(width / 2, cardY + 55, rankEmoji, {
            fontSize: Math.floor(height * 0.08) + 'px'
        }).setOrigin(0.5);

        // GAME OVER text
        this.add.text(width / 2, cardY + 110, 'GAME OVER', {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.042) + 'px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#166534',
            strokeThickness: 5
        }).setOrigin(0.5);

        // Rank
        this.add.text(width / 2, cardY + 155, rank, {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.03) + 'px',
            fontStyle: 'italic',
            color: rankColor
        }).setOrigin(0.5);

        // Score number (big, animated)
        const scoreText = this.add.text(width / 2, cardY + 215, '0', {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.floor(height * 0.075) + 'px',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#7a5c00',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Animate score count up
        let displayScore = 0;
        const scoreInterval = this.time.addEvent({
            delay: 30,
            repeat: 40,
            callback: () => {
                displayScore = Math.min(this.finalScore, displayScore + Math.ceil(this.finalScore / 40));
                scoreText.setText(displayScore.toLocaleString('id-ID'));
            }
        });

        this.add.text(width / 2, cardY + 265, 'TOTAL SKOR', {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '14px',
            color: '#86efac',
            letterSpacing: 3
        }).setOrigin(0.5);

        // Divider
        const divGfx = this.add.graphics();
        divGfx.lineStyle(1, 0x4ade80, 0.4);
        divGfx.lineBetween(cardX + 40, cardY + 290, cardX + cardW - 40, cardY + 290);

        // Stats row
        const statsY = cardY + 315;
        const statItems = [
            { label: 'Benar', value: `${this.correctAnswers}/${this.totalQuestions}`, icon: '✅' },
            { label: 'Akurasi', value: `${accuracy}%`, icon: '🎯' },
            { label: 'Level', value: this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1), icon: '⚡' }
        ];

        const statW = (cardW - 60) / statItems.length;
        statItems.forEach((stat, i) => {
            const sx = cardX + 30 + i * statW;

            this.add.text(sx + statW / 2, statsY, stat.icon, {
                fontSize: '24px'
            }).setOrigin(0.5);

            this.add.text(sx + statW / 2, statsY + 32, stat.value, {
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);

            this.add.text(sx + statW / 2, statsY + 56, stat.label, {
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: '12px',
                color: '#86efac',
                letterSpacing: 1
            }).setOrigin(0.5);
        });

        // Buttons
        const btnY = cardY + cardH - 80;
        const btnW2 = (cardW - 60) / 2;

        // Retry button
        this._createButton(cardX + 20, btnY, btnW2 - 10, 50, '🔄  Main Lagi', 0x15803d, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('GameScene', {
                    difficulty: this.difficulty,
                    questionTime: this.questionTime
                });
            });
        });

        // Menu button
        this._createButton(cardX + 30 + btnW2, btnY, btnW2 - 10, 50, '🏠  Menu Utama', 0x1e40af, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('MenuScene');
            });
        });

        // SDGs message
        this.add.text(width / 2, height - 20, 'Bersama kita jaga bumi 🌍 — SDGs Goal 13: Climate Action', {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '12px',
            color: 'rgba(134,239,172,0.7)'
        }).setOrigin(0.5);

        this.cameras.main.fadeIn(500);
    }

    _createButton(x, y, w, h, label, color, onClick) {
        const btnGfx = this.add.graphics();
        btnGfx.fillStyle(color, 1);
        btnGfx.fillRoundedRect(x, y, w, h, 12);

        const btnTxt = this.add.text(x + w / 2, y + h / 2, label, {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        const hitArea = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0)
            .setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            btnGfx.clear();
            btnGfx.fillStyle(color, 0.8);
            btnGfx.fillRoundedRect(x, y, w, h, 12);
            btnGfx.lineStyle(2, 0xffffff, 0.7);
            btnGfx.strokeRoundedRect(x, y, w, h, 12);
            this.tweens.add({ targets: btnTxt, scaleX: 1.05, scaleY: 1.05, duration: 80 });
        });

        hitArea.on('pointerout', () => {
            btnGfx.clear();
            btnGfx.fillStyle(color, 1);
            btnGfx.fillRoundedRect(x, y, w, h, 12);
            this.tweens.add({ targets: btnTxt, scaleX: 1, scaleY: 1, duration: 80 });
        });

        hitArea.on('pointerdown', onClick);
    }

    _drawStars() {
        const { width, height } = this.scale;
        const stars = this.add.graphics();
        stars.fillStyle(0xffffff, 0.4);
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = Math.random() * 2 + 0.5;
            stars.fillCircle(x, y, r);
        }
    }
}
