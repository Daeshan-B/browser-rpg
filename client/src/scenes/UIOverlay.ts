import Phaser from 'phaser';

export class UIOverlay extends Phaser.Scene {
  constructor() { super({ key: 'UIOverlay' }); }

  create(): void {
    this.add.graphics().fillStyle(0x1a1a2e, 0.9).fillRect(0, 0, this.scale.width, 40);
    this.add.text(10, 10, 'BrowserRPG', { font: '16px "Courier New"', color: '#4a90d9' });
    this.add.graphics().fillStyle(0x1a1a2e, 0.9).fillRect(0, this.scale.height - 60, this.scale.width, 60);
    this.add.text(this.scale.width / 2, this.scale.height - 30, '[ Actions Bar - Coming Soon ]', { font: '14px "Courier New"', color: '#888888' }).setOrigin(0.5);
  }
}
