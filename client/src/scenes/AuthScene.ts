import Phaser from 'phaser';
import { apiClient } from '../api/client';

export class AuthScene extends Phaser.Scene {
  private currentMode: 'login' | 'register' = 'login';
  private statusText: Phaser.GameObjects.Text | null = null;
  private usernameInput: HTMLInputElement | null = null;
  private emailInput: HTMLInputElement | null = null;
  private passwordInput: HTMLInputElement | null = null;

  constructor() { super({ key: 'AuthScene' }); }

  create(): void {
    this.add.graphics().fillStyle(0x1a1a2e, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.add.text(this.scale.width / 2, this.scale.height / 3, 'BROWSER RPG', { font: '48px "Courier New"', color: '#4a90d9', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, this.scale.height / 3 + 60, 'A Retro Nation Building Game', { font: '18px "Courier New"', color: '#888888' }).setOrigin(0.5);
    this.add.graphics().fillStyle(0x2a2a4e, 1).fillRect(this.scale.width / 2 - 200, this.scale.height / 2, 400, 300);
    this.createInputs();
    this.createButtons();
    this.statusText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 260, '', { font: '14px "Courier New"', color: '#fbbf24' }).setOrigin(0.5);
  }

  private createInputs(): void {
    const bx = this.scale.width / 2 - 180, by = this.scale.height / 2 + 40;
    if (this.currentMode === 'register') {
      this.add.text(bx, by, 'Username:', { font: '16px "Courier New"', color: '#cccccc' });
      this.usernameInput = this.createInput(bx + 80, by + 5, 'username', 'text', 'Enter username...');
    }
    const ey = this.currentMode === 'register' ? by + 40 : by;
    this.add.text(bx, ey, 'Email:', { font: '16px "Courier New"', color: '#cccccc' });
    this.emailInput = this.createInput(bx + 80, ey + 5, 'email', 'email', 'Enter email...');
    const py = ey + 40;
    this.add.text(bx, py, 'Password:', { font: '16px "Courier New"', color: '#cccccc' });
    this.passwordInput = this.createInput(bx + 80, py + 5, 'password', 'password', 'Enter password...');
  }

  private createInput(x: number, y: number, id: string, type: string, placeholder: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type; input.id = id; input.placeholder = placeholder;
    input.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:200px;height:25px;padding:5px;background:#1a1a2e;color:#fff;border:2px solid #4a90d9;border-radius:4px;font-size:14px;font-family:Courier New;`;
    const container = this.game.canvas.parentElement;
    if (container) container.appendChild(input);
    return input;
  }

  private createButtons(): void {
    const btn = '#4a90d9', hover = '#5aa0e9';
    const pBtn = this.add.text(this.scale.width / 2 - 80, this.scale.height / 2 + 220, this.currentMode === 'login' ? '[ LOGIN ]' : '[ REGISTER ]', { font: '20px "Courier New"', color: '#ffffff', backgroundColor: btn }).setOrigin(0.5).setInteractive();
    pBtn.on('pointerover', () => pBtn.setStyle({ backgroundColor: hover }));
    pBtn.on('pointerout', () => pBtn.setStyle({ backgroundColor: btn }));
    pBtn.on('pointerdown', () => this.handleAction());
    const sBtn = this.add.text(this.scale.width / 2 + 100, this.scale.height / 2 + 220, this.currentMode === 'login' ? '[ REGISTER ]' : '[ LOGIN ]', { font: '18px "Courier New"', color: '#ffffff', backgroundColor: '#333333' }).setOrigin(0.5).setInteractive();
    sBtn.on('pointerover', () => sBtn.setStyle({ backgroundColor: '#444444' }));
    sBtn.on('pointerout', () => sBtn.setStyle({ backgroundColor: '#333333' }));
    sBtn.on('pointerdown', () => this.switchMode());
  }

  private async handleAction(): Promise<void> {
    if (this.statusText) this.statusText.setText('Processing...');
    try {
      if (this.currentMode === 'login') await this.handleLogin();
      else await this.handleRegister();
    } catch (error: any) {
      if (this.statusText) { this.statusText.setText(error.response?.data?.error || 'Error'); this.statusText.setColor('#ff4444'); }
    }
  }

  private async handleLogin(): Promise<void> {
    const email = this.emailInput?.value || '', password = this.passwordInput?.value || '';
    if (!email || !password) throw new Error('Enter email and password');
    const response = await apiClient.login(email, password);
    if (this.statusText) { this.statusText.setText('Login successful!'); this.statusText.setColor('#4ade80'); }
    console.log('✅ Logged in:', response.user);
    setTimeout(() => this.scene.start('NationScene'), 1000);
  }

  private async handleRegister(): Promise<void> {
    const username = this.usernameInput?.value || '', email = this.emailInput?.value || '', password = this.passwordInput?.value || '';
    if (!username || !email || !password) throw new Error('Fill all fields');
    const response = await apiClient.register(username, email, password);
    if (this.statusText) { this.statusText.setText('Registration successful!'); this.statusText.setColor('#4ade80'); }
    console.log('✅ Registered:', response.user);
    setTimeout(() => this.scene.start('NationScene'), 1000);
  }

  private switchMode(): void {
    this.currentMode = this.currentMode === 'login' ? 'register' : 'login';
    this.scene.restart();
  }
}
