// src/main.js - Initialize Phaser and scenes
import { MenuScene } from './scenes/MenuScene.js?v=1.0.1';
import { GameScene } from './scenes/GameScene.js?v=1.0.2';
import { QuestionScene } from './scenes/QuestionScene.js?v=1.0.1';
import { ScoreScene } from './scenes/ScoreScene.js?v=1.0.1';

window.addEventListener('load', () => {
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: 960,
        height: 640,
        backgroundColor: '#071a0f',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        input: {
            mouse: {
                preventDefaultWheel: false
            }
        },
        scene: [MenuScene, GameScene, QuestionScene, ScoreScene]
    };

    try {
        const game = new Phaser.Game(config);
        console.log('Phaser game started.');
    } catch (err) {
        console.error('Failed to start Phaser game:', err);
        const el = document.getElementById('game-container');
        if (el) el.innerText = 'Failed to start game. Check console for errors.';
    }
});
