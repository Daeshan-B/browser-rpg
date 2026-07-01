import Phaser from 'phaser';
import { TILE_SIZE_SOURCE } from '../../assets/tile-config';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload(): void {
    // Loading background
    this.add.graphics().fillStyle(0x1a1a2e, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Loading text
    const loadingText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      'LOADING BROWSER RPG...',
      { font: '24px "Courier New"', color: '#ffffff', fontStyle: 'bold' }
    ).setOrigin(0.5);
    
    // Loading bar
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRect(this.scale.width / 2 - 150, this.scale.height / 2, 300, 30);
    
    const bar = this.add.graphics();
    
    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0x4a90d9, 1);
      bar.fillRect(this.scale.width / 2 - 150, this.scale.height / 2, 300 * value, 30);
      loadingText.setText(`LOADING... ${Math.round(value * 100)}%`);
    });
    
    this.load.on('complete', () => { loadingText.setText('READY!'); });
    
    // Load tileset as sprite sheet
    this.load.image('tileset', 'assets/urizen_onebit_tileset__v2d0.png');
    
    // Set up tileset as sprite sheet with 16x16 frames
    this.load.spritesheet('tiles', 'assets/urizen_onebit_tileset__v2d0.png', {
      frameWidth: TILE_SIZE_SOURCE,
      frameHeight: TILE_SIZE_SOURCE
    });
    
    this.load.start();
    
    this.load.on('complete', () => {
      console.log('✅ All assets loaded!');
      console.log('📦 Tileset frames:', this.textures.list);
      this.time.delayedCall(500, () => this.scene.start('AuthScene'));
    });
  }

  create(): void {}
}
