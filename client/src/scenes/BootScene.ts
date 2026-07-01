import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading bar
    const { graphics } = this.scene;
    
    // Loading background
    graphics.addGraphics().fillStyle(0x1a1a2e, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    
    // Loading text
    const loadingText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      'LOADING BROWSER RPG...',
      {
        font: '24px "Courier New"',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Loading bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRect(this.scale.width / 2 - 150, this.scale.height / 2, 300, 30);

    // Loading bar foreground
    const bar = this.add.graphics();
    
    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0x4a90d9, 1);
      bar.fillRect(this.scale.width / 2 - 150, this.scale.height / 2, 300 * value, 30);
      
      // Update percentage
      loadingText.setText(`LOADING... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      loadingText.setText('READY!');
    });

    // Load assets (we'll add actual assets later)
    // For now, just transition after a brief moment
    this.time.delayedCall(1000, () => {
      this.scene.start('AuthScene');
    });
  }

  create(): void {
    // Boot scene setup
  }
}