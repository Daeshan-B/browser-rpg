import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload(): void {
    this.add.graphics().fillStyle(0x1a1a2e, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    
    const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'LOADING BROWSER RPG...', { font: '24px "Courier New"', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    
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
    
    this.load.image('tileset', 'assets/urizen_onebit_tileset__v2d0.png');
    this.load.start();
    
    this.load.on('complete', () => {
      console.log('✅ All assets loaded!');
      this.time.delayedCall(500, () => this.scene.start('AuthScene'));
    });
  }

  create(): void {}
}
