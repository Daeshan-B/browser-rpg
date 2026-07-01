import Phaser from 'phaser';

export class AuthScene extends Phaser.Scene {
  private loginButton: Phaser.GameObjects.Text;
  constuctor() {
    super({ key: 'AuthScene' });
  }

  create(): void {
    const { graphics, add, text, scale } = this;
    
    // Background
    graphics.addGraphics().fillStyle(0x1a1a2e, 1).fillRect(0, 0, scale.width, scale.height);
    
    // Title
    const title = add.text(scale.width / 2, scale.height / 3, 'BROWSER RPG', {
      font: '48px "Courier New"',
      color: '#4a90d9',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const subtitle = add.text(scale.width / 2, scale.height / 3 + 60, 'A Retro Nation Building Game', {
      font: '18px "Courier New"',
      color: '#888888'
    }).setOrigin(0.5);
    
    // Login form container
    const formBg = add.graphics();
    formBg.fillStyle(0x2a2a4e, 1);
    formBg.fillRect(scale.width / 2 - 200, scale.height / 2, 400, 300);
    
    // Username field placeholder
    const usernameLabel = add.text(scale.width / 2 - 180, scale.height / 2 + 40, 'Username:', {
      font: '16px "Courier New"',
      color: '#cccccc'
    });
    
    const usernameInput = add.text(scale.width / 2 - 180, scale.height / 2 + 70, 'Enter username...', {
      font: '16px "Courier New"',
      color: '#888888'
    });
    
    // Email field placeholder
    const emailLabel = add.text(scale.width / 2 - 180, scale.height / 2 + 120, 'Email:', {
      font: '16px "Courier New"',
      color: '#cccccc'
    });
    
    const emailInput = add.text(scale.width / 2 - 180, scale.height / 2 + 150, 'Enter email...', {
      font: '16px "Courier New"',
      color: '#888888'
    });
    
    // Buttons
    const loginBtn = add.text(scale.width / 2 - 100, scale.height / 2 + 220, '[ LOGIN ]', {
      font: '20px "Courier New"',
      color: '#ffffff',
      backgroundColor: '#4a90d9'
    }).setOrigin(0.5).setInteractive();
    
    const registerBtn = add.text(scale.width / 2 + 100, scale.height / 2 + 220, '[ REGISTER ]', {
      font: '20px "Courier New"',
      color: '#ffffff',
      backgroundColor: '#4a90d9'
    }).setOrigin(0.5).setInteractive();
    
    // Button interactions
    loginBtn.on('pointerover', () => loginBtn.setStyle({ backgroundColor: '#5aa0e9' }));
    loginBtn.on('pointerout', () => loginBtn.setStyle({ backgroundColor: '#4a90d9' }));
    loginBtn.on('pointerdown', () => this.handleLogin());
    
    registerBtn.on('pointerover', () => registerBtn.setStyle({ backgroundColor: '#5aa0e9' }));
    registerBtn.on('pointerout', () => registerBtn.setStyle({ backgroundColor: '#4a90d9' }));
    registerBtn.on('pointerdown', () => this.handleRegister());
  }
  
  private handleLogin(): void {
    // TODO: Implement login logic
    console.log('Login clicked');
    // For now, just go to game scene
    this.scene.start('GameScene');
  }
  
  private handleRegister(): void {
    // TODO: Implement register logic
    console.log('Register clicked');
  }
}