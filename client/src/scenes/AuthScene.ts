import Phaser from 'phaser';
import { apiClient } from '../api/client';

export class AuthScene extends Phaser.Scene {
  private emailInput: string = '';
  private passwordInput: string = '';
  private currentMode: 'login' | 'register' = 'login';
  private usernameInput: string = '';
  private statusText: Phaser.GameObjects.Text | null = null;

  constructor() { super({ key: 'AuthScene' }); }

  create(): void {
    this.add.graphics().fillStyle(0x1a1a2e, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.add.text(this.scale.width / 2, this.scale.height / 3, 'BROWSER RPG', { font: '48px "Courier New"', color: '#4a90d9', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, this.scale.height / 3 + 60, 'A Retro Nation Building Game', { font: '18px "Courier New"', color: '#888888' }).setOrigin(0.5);
    this.add.graphics().fillStyle(0x2a2a4e, 1).fillRect(this.scale.width / 2 - 200, this.scale.height / 2, 400, 280);
    
    const y = this.scale.height / 2 + 40;
    this.add.text(this.scale.width / 2 - 180, y, 'Email:', { font: '16px "Courier New"', color: '#cccccc' });
    this.add.text(this.scale.width / 2 - 180, y + 30, this.emailInput || 'Enter email...', { font: '16px "Courier New"', color: this.emailInput ? '#ffffff' : '#888888' });
    this.add.text(this.scale.width / 2 - 180, y + 60, 'Password:', { font: '16px "Courier New"', color: '#cccccc' });
    this.add.text(this.scale.width / 2 - 180, y + 90, '•'.repeat(Math.min(this.passwordInput.length, 10)) || 'Enter password...', { font: '16px "Courier New"', color: this.passwordInput ? '#ffffff' : '#888888' });
    
    this.statusText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 240, '', { font: '14px "Courier New"', color: '#fbbf24' }).setOrigin(0.5);
    
    const btnColor = '#4a90d9';
    const primaryBtn = this.add.text(this.scale.width / 2 - 80, this.scale.height / 2 + 220, this.currentMode === 'login' ? '[ LOGIN ]' : '[ REGISTER ]', { font: '20px "Courier New"', color: '#ffffff', backgroundColor: btnColor }).setOrigin(0.5).setInteractive();
    primaryBtn.on('pointerover', () => primaryBtn.setStyle({ backgroundColor: '#5aa0e9' }));
    primaryBtn.on('pointerout', () => primaryBtn.setStyle({ backgroundColor: btnColor }));
    primaryBtn.on('pointerdown', () => this.handlePrimaryAction());
    
    const switchBtn = this.add.text(this.scale.width / 2 + 100, this.scale.height / 2 + 220, this.currentMode === 'login' ? '[ REGISTER ]' : '[ LOGIN ]', { font: '18px "Courier New"', color: '#ffffff', backgroundColor: '#333333' }).setOrigin(0.5).setInteractive();
    switchBtn.on('pointerover', () => switchBtn.setStyle({ backgroundColor: '#444444' }));
    switchBtn.on('pointerout', () => switchBtn.setStyle({ backgroundColor: '#333333' }));
    switchBtn.on('pointerdown', () => this.switchMode());
  }

  private async handlePrimaryAction(): Promise<void> {
    if (this.statusText) this.statusText.setText('Processing...');
    try {
      if (this.currentMode === 'login') await this.handleLogin();
      else await this.handleRegister();
    } catch (error: any) {
      if (this.statusText) { this.statusText.setText(error.response?.data?.error || 'Error occurred'); this.statusText.setColor('#ff4444'); }
    }
  }

  private async handleLogin(): Promise<void> {
    if (!this.emailInput || !this.passwordInput) throw new Error('Enter email and password');
    const response = await apiClient.login(this.emailInput, this.passwordInput);
    if (this.statusText) { this.statusText.setText('Login successful!'); this.statusText.setColor('#4ade80'); }
    console.log('✅ Logged in:', response.user);
    setTimeout(() => this.scene.start('GameScene'), 1000);
  }

  private async handleRegister(): Promise<void> {
    if (!this.usernameInput || !this.emailInput || !this.passwordInput) throw new Error('Fill all fields');
    const response = await apiClient.register(this.usernameInput, this.emailInput, this.passwordInput);
    if (this.statusText) { this.statusText.setText('Registration successful!'); this.statusText.setColor('#4ade80'); }
    console.log('✅ Registered:', response.user);
    setTimeout(() => this.scene.start('GameScene'), 1000);
  }

  private switchMode(): void {
    this.currentMode = this.currentMode === 'login' ? 'register' : 'login';
    this.usernameInput = ''; this.emailInput = ''; this.passwordInput = '';
    this.scene.restart();
  }
}
