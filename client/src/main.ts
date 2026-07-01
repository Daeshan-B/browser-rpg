import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { AuthScene } from './scenes/AuthScene';
import { NationScene } from './scenes/NationScene';
import { GameScene } from './scenes/GameScene';
import { UIOverlay } from './scenes/UIOverlay';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, AuthScene, NationScene, GameScene, UIOverlay],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => { game.scale.resize(window.innerWidth, window.innerHeight); });