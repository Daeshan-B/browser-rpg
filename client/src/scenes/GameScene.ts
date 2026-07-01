import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { graphics, add, scale, cameraMain } = this;
    
    // Background
    graphics.addGraphics().fillStyle(0x0a0a1a, 1).fillRect(0, 0, scale.width, scale.height);
    
    // Title text
    const title = add.text(scale.width / 2, scale.height / 3, 'WORLD MAP', {
      font: '32px "Courier New"',
      color: '#4a90d9',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Instructions
    const instructions = add.text(scale.width / 2, scale.height / 2, 
      'World map will appear here\n\n(Waiting for backend connection)', 
      {
        font: '16px "Courier New"',
        color: '#888888',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Grid placeholder (will be replaced with actual tiles)
    const gridSize = 32; // tile size
    const cols = Math.floor(scale.width / gridSize);
    const rows = Math.floor(scale.height / gridSize);
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tileX = x * gridSize;
        const tileY = y * gridSize;
        
        // Draw placeholder tile
        graphics.addGraphics().lineStyle(1, 0x2a2a4e, 1)
          .strokeRect(tileX, tileY, gridSize, gridSize);
      }
    }
    
    // Camera settings
    cameraMain.setBackgroundColor(0x0a0a1a);
  }
  
  update(): void {
    // Game loop logic will go here
  }
}