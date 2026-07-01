import Phaser from 'phaser';

export class UIOverlay extends Phaser.Scene {
  constructor() {
    super({ key: 'UIOverlay' });
  }

  create(): void {
    const { add, scale } = this;
    
    // This scene will overlay UI elements on top of the game
    // Currently empty, will be populated as we build UI components
    
    // Example: Top bar for resources
    const topBar = add.graphics();
    topBar.fillStyle(0x1a1a2e, 0.9);
    topBar.fillRect(0, 0, scale.width, 40);
    
    const titleLabel = add.text(10, 10, 'BrowserRPG', {
      font: '16px "Courier New"',
      color: '#4a90d9'
    });
    
    // Example: Bottom bar for actions
    const bottomBar = add.graphics();
    bottomBar.fillStyle(0x1a1a2e, 0.9);
    bottomBar.fillRect(0, scale.height - 60, scale.width, 60);
    
    const actionLabel = add.text(scale.width / 2, scale.height - 30, 
      '[ Actions Bar - Coming Soon ]', {
        font: '14px "Courier New"',
        color: '#888888'
      }
    ).setOrigin(0.5);
  }
}