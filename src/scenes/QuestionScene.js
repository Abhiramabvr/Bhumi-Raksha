// QuestionScene.js - Popup pertanyaan & sistem jawaban
export class QuestionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuestionScene' });
    }

    init(data) {
        this.questionData = data.question;
        this.questionTime = data.questionTime || 10;
        this.onAnswerCallback = data.onAnswer; // callback(correct: bool)
        this.shuffledOptions = data.shuffledOptions;
        this.correctIndex = data.correctIndex;
    }

    create() {
        const { width, height } = this.scale;

        // Dim overlay background
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.72);
        overlay.fillRect(0, 0, width, height);

        // === Popup card ===
        const popW = Math.min(700, width - 40);
        const popH = Math.min(430, height - 60);
        const popX = (width - popW) / 2;
        const popY = (height - popH) / 2;

        // Card background with gradient effect via layered graphics
        const card = this.add.graphics();
        card.fillStyle(0x0f2a1e, 0.98);
        card.fillRoundedRect(popX, popY, popW, popH, 20);
        card.lineStyle(3, 0x4ade80, 0.9);
        card.strokeRoundedRect(popX, popY, popW, popH, 20);

        // Top accent bar
        const accent = this.add.graphics();
        accent.fillStyle(0x22c55e, 1);
        accent.fillRoundedRect(popX, popY, popW, 8, { tl: 20, tr: 20, bl: 0, br: 0 });

        // Category badge
        const catBadge = this.add.graphics();
        catBadge.fillStyle(0x166534, 1);
        catBadge.fillRoundedRect(popX + 20, popY + 18, 200, 30, 8);

        this.add.text(popX + 120, popY + 33, `📚 ${this.questionData.category}`, {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '14px',
            color: '#86efac'
        }).setOrigin(0.5);

        // Timer bar background
        const timerBarBg = this.add.graphics();
        timerBarBg.fillStyle(0x1a3a2a, 1);
        timerBarBg.fillRoundedRect(popX + 20, popY + 55, popW - 40, 10, 5);

        // Timer bar fill (dynamic)
        this.timerBarFill = this.add.graphics();
        this._drawTimerBar(1.0, popX + 20, popY + 55, popW - 40, 10);

        // Timer text
        this.timerText = this.add.text(popX + popW - 20, popY + 33, `⏱ ${this.questionTime}s`, {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#fbbf24'
        }).setOrigin(1, 0.5);

        // Question text
        const qStyle = {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: Math.min(22, Math.floor(popW / 28)) + 'px',
            fontStyle: 'bold',
            color: '#f0fdf4',
            wordWrap: { width: popW - 60 },
            align: 'center'
        };
        this.add.text(width / 2, popY + 105, this.questionData.question, qStyle)
            .setOrigin(0.5);

        // Answer options
        this.answerButtons = [];
        this.answered = false;

        const optionLetters = ['A', 'B', 'C', 'D'];
        const optColors = [0x1d4ed8, 0x7c3aed, 0xb45309, 0x0f766e];
        const colCount = 2;
        const btnW = (popW - 60) / colCount - 10;
        const btnH = 50;
        const startY = popY + 155;
        const padding = 10;

        this.shuffledOptions.forEach((optText, i) => {
            const col = i % colCount;
            const row = Math.floor(i / colCount);
            const bx = popX + 20 + col * (btnW + padding * 2);
            const by = startY + row * (btnH + 12);

            const btnGfx = this.add.graphics();
            btnGfx.fillStyle(optColors[i], 0.85);
            btnGfx.fillRoundedRect(bx, by, btnW, btnH, 10);

            const optLabel = `${optionLetters[i]}. ${optText}`;
            const btnTxt = this.add.text(bx + btnW / 2, by + btnH / 2, optLabel, {
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontSize: Math.min(16, Math.floor(btnW / 14)) + 'px',
                color: '#fff',
                wordWrap: { width: btnW - 20 },
                align: 'center'
            }).setOrigin(0.5);

            const hitArea = this.add.rectangle(bx + btnW / 2, by + btnH / 2, btnW, btnH, 0x000000, 0)
                .setInteractive({ useHandCursor: true });

            hitArea.on('pointerover', () => {
                if (this.answered) return;
                btnGfx.clear();
                btnGfx.fillStyle(optColors[i], 1);
                btnGfx.fillRoundedRect(bx, by, btnW, btnH, 10);
                btnGfx.lineStyle(2, 0xffffff, 0.8);
                btnGfx.strokeRoundedRect(bx, by, btnW, btnH, 10);
                this.tweens.add({ targets: btnTxt, scaleX: 1.04, scaleY: 1.04, duration: 80 });
            });

            hitArea.on('pointerout', () => {
                if (this.answered) return;
                btnGfx.clear();
                btnGfx.fillStyle(optColors[i], 0.85);
                btnGfx.fillRoundedRect(bx, by, btnW, btnH, 10);
                this.tweens.add({ targets: btnTxt, scaleX: 1, scaleY: 1, duration: 80 });
            });

            hitArea.on('pointerdown', () => {
                if (this.answered) return;
                this._submitAnswer(i, btnGfx, bx, by, btnW, btnH, optColors);
            });

            this.answerButtons.push({ gfx: btnGfx, text: btnTxt, hitArea, bx, by, btnW, btnH, colorIdx: i, optColors });
        });

        // Explanation area (hidden initially)
        this.explanationBg = this.add.graphics().setVisible(false);
        this.explanationTxt = this.add.text(width / 2, popY + popH - 35, '', {
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontSize: '14px',
            color: '#a7f3d0',
            wordWrap: { width: popW - 60 },
            align: 'center'
        }).setOrigin(0.5).setVisible(false);

        // ============ TIMER ============
        this.timeLeft = this.questionTime;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this._onTick,
            callbackScope: this,
            repeat: this.questionTime - 1
        });

        // Popup appear animation
        overlay.setAlpha(0);
        card.setAlpha(0);
        this.tweens.add({ targets: overlay, alpha: 1, duration: 200 });
        this.tweens.add({ targets: card, alpha: 1, duration: 300 });

        // Keyboard input (A/B/C/D or 1/2/3/4)
        const keyMap = {
            A: 0, B: 1, C: 2, D: 3,
            ONE: 0, TWO: 1, THREE: 2, FOUR: 3
        };
        Object.entries(keyMap).forEach(([key, idx]) => {
            const k = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[key]);
            k.once('down', () => {
                if (!this.answered && idx < this.shuffledOptions.length) {
                    const btn = this.answerButtons[idx];
                    this._submitAnswer(idx, btn.gfx, btn.bx, btn.by, btn.btnW, btn.btnH, btn.optColors);
                }
            });
        });

        // Store popup bounds for later
        this._popX = popX;
        this._popY = popY;
        this._popW = popW;
        this._popH = popH;
    }

    _drawTimerBar(fraction, x, y, maxW, h) {
        this.timerBarFill.clear();
        const ratio = Math.max(0, fraction);
        const color = ratio > 0.5 ? 0x22c55e : (ratio > 0.25 ? 0xfbbf24 : 0xef4444);
        this.timerBarFill.fillStyle(color, 1);
        this.timerBarFill.fillRoundedRect(x, y, maxW * ratio, h, 5);
        this._timerBarX = x;
        this._timerBarY = y;
        this._timerBarMaxW = maxW;
        this._timerBarH = h;
    }

    _onTick() {
        this.timeLeft--;
        const fraction = this.timeLeft / this.questionTime;
        this._drawTimerBar(fraction, this._timerBarX, this._timerBarY, this._timerBarMaxW, this._timerBarH);

        this.timerText.setText(`⏱ ${this.timeLeft}s`);

        if (this.timeLeft <= 0) {
            this._submitAnswer(-1, null, 0, 0, 0, 0, []); // timeout = wrong
        }
    }

    _submitAnswer(selectedIndex, btnGfx, bx, by, btnW, btnH, optColors) {
        if (this.answered) return;
        this.answered = true;
        this.timerEvent.remove();

        const isCorrect = selectedIndex === this.correctIndex;
        const bonusTime = this.timeLeft > this.questionTime - 5; // answered in <5s

        // Highlight correct/wrong
        this.answerButtons.forEach((btn, i) => {
            btn.hitArea.disableInteractive();
            if (i === this.correctIndex) {
                // Show correct answer in green
                btn.gfx.clear();
                btn.gfx.fillStyle(0x16a34a, 1);
                btn.gfx.fillRoundedRect(btn.bx, btn.by, btn.btnW, btn.btnH, 10);
                btn.gfx.lineStyle(3, 0x86efac, 1);
                btn.gfx.strokeRoundedRect(btn.bx, btn.by, btn.btnW, btn.btnH, 10);
            } else if (i === selectedIndex && !isCorrect) {
                // Show wrong answer in red
                btn.gfx.clear();
                btn.gfx.fillStyle(0xdc2626, 1);
                btn.gfx.fillRoundedRect(btn.bx, btn.by, btn.btnW, btn.btnH, 10);
            }
        });

        // Show explanation
        this.explanationBg.setVisible(true);
        this.explanationTxt.setVisible(true);

        const expPrefix = isCorrect ? '✅ Benar! ' : (selectedIndex === -1 ? '⏰ Waktu Habis! ' : '❌ Salah! ');
        this.explanationTxt.setText(expPrefix + this.questionData.explanation);

        // Close popup after delay
        const closeDelay = isCorrect ? 2000 : 2500;
        this.time.delayedCall(closeDelay, () => {
            this.tweens.add({
                targets: this.cameras.main,
                alpha: 0,
                duration: 250,
                onComplete: () => {
                    // Resume GameScene
                    this.scene.stop('QuestionScene');
                    const gameScene = this.scene.get('GameScene');
                    if (gameScene && gameScene.onQuestionResolved) {
                        gameScene.onQuestionResolved(isCorrect, bonusTime && isCorrect);
                    }
                }
            });
        });
    }

    update() {
        // Timer bar animation handled by timerEvent ticks
    }
}
