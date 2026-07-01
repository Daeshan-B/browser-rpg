import Phaser from 'phaser';
import { apiClient } from '../api/client';

export class NationScene extends Phaser.Scene {
  private nationNameInput: HTMLInputElement | null = null;
  private colorInput: HTMLInputElement | null = null;
  private statusText: Phaser.GameObjects.Text | null = null;
  private selectedSpawnX = 250;
  private selectedSpawnY = 250;

  constructor() { super({ key: 'NationScene' }); }

  async create(): Promise<void> {
    const hasNation = await this.checkExistingNation();
    if (hasNation) { console.log('✅ Already has nation'); this.scene.start('GameScene'); return; }
    this.add.graphics().fillStyle(0x1a1a2e, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.add.text(this.scale.width / 2, 60, 'CREATE YOUR NATION', { font: '36px "Courier New"', color: '#4a90d9', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, 100, 'Choose name, color, and spawn location', { font: '16px "Courier New"', color: '#888888' }).setOrigin(0.5);
    this.createForm();
    this.createSpawnPreview();
    this.createButtons();
    this.statusText = this.add.text(this.scale.width / 2, this.scale.height - 80, '', { font: '14px "Courier New"', color: '#fbbf24' }).setOrigin(0.5);
    await this.loadSpawnZones();
  }

  private async checkExistingNation(): Promise<boolean> {
    try { const r = await apiClient.getMyNations(); return r.nations?.some((n: any) => n.role === 'LEADER') === true; }
    catch (err) { console.error('Check nations failed:', err); return false; }
  }

  private createForm(): void {
    const bx = this.scale.width / 2 - 150, by = 160;
    this.add.text(bx, by, 'Nation Name:', { font: '16px "Courier New"', color: '#cccccc' });
    this.nationNameInput = this.createInput(bx + 100, by + 5, 'nationName', 'text', 'Enter nation name...');
    this.add.text(bx, by + 40, 'Nation Color:', { font: '16px "Courier New"', color: '#cccccc' });
    this.colorInput = this.createColorPicker(bx + 100, by + 45, 'nationColor');
  }

  private createInput(x: number, y: number, id: string, type: string, placeholder: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type; input.id = id; input.placeholder = placeholder;
    input.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:180px;height:25px;padding:5px;background:#1a1a2e;color:#fff;border:2px solid #4a90d9;border-radius:4px;font-size:14px;font-family:Courier New;`;
    this.game.canvas.parentElement?.appendChild(input);
    return input;
  }

  private createColorPicker(x: number, y: number, id: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'color'; input.id = id; input.value = '#4a90d9';
    input.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:50px;height:30px;border:none;cursor:pointer;`;
    this.game.canvas.parentElement?.appendChild(input);
    return input;
  }

  private createSpawnPreview(): void {
    this.add.text(this.scale.width / 2, 240, 'Click map to select spawn', { font: '14px "Courier New"', color: '#888888' }).setOrigin(0.5);
    const pw = 200, ph = 200, px = this.scale.width / 2 - pw / 2, py = 280;
    this.add.graphics().fillStyle(0x2a2a4e, 1).fillRect(px, py, pw, ph);
    this.add.text(px + 10, py + 5, 'World (500x500)', { font: '12px "Courier New"', color: '#666666' });
    const scale = pw / 500;
    const g = this.add.graphics();
    g.lineStyle(1, 0x3a3a5e, 1);
    for (let i = 0; i <= 500; i += 50) {
      g.beginPath(); g.moveTo(px + i * scale, py); g.lineTo(px + i * scale, py + ph); g.strokePath();
      g.beginPath(); g.moveTo(px, py + i * scale); g.lineTo(px + pw, py + i * scale); g.strokePath();
    }
    this.add.circle(px + this.selectedSpawnX * scale, py + this.selectedSpawnY * scale, 5, 0xff4444);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const wx = p.worldX - px, wy = p.worldY - py;
      if (wx >= 0 && wx <= pw && wy >= 0 && wy <= ph) {
        this.selectedSpawnX = Math.floor((wx / pw) * 500);
        this.selectedSpawnY = Math.floor((wy / ph) * 500);
        console.log(`Spawn: (${this.selectedSpawnX}, ${this.selectedSpawnY})`);
      }
    });
  }

  private createButtons(): void {
    const btn = '#4a90d9', hover = '#5aa0e9';
    const createBtn = this.add.text(this.scale.width / 2, this.scale.height - 140, '[ CREATE NATION ]', { font: '20px "Courier New"', color: '#ffffff', backgroundColor: btn }).setOrigin(0.5).setInteractive();
    createBtn.on('pointerover', () => createBtn.setStyle({ backgroundColor: hover }));
    createBtn.on('pointerout', () => createBtn.setStyle({ backgroundColor: btn }));
    createBtn.on('pointerdown', () => this.createNation());
  }

  private async loadSpawnZones(): Promise<void> {
    try { const r = await apiClient.getSpawnZones(); console.log('📍 Spawn zones:', r.spawnZones); }
    catch (err) { console.error('Load spawn zones failed:', err); }
  }

  private async createNation(): Promise<void> {
    const name = this.nationNameInput?.value || '';
    const color = this.colorInput?.value || '#4a90d9';
    if (!name) { if (this.statusText) { this.statusText.setText('Enter nation name'); this.statusText.setColor('#ff4444'); } return; }
    if (this.statusText) this.statusText.setText('Creating nation...');
    try {
      const response = await apiClient.createNation(name, color, this.selectedSpawnX, this.selectedSpawnY);
      console.log('✅ Nation created:', response.nation);
      if (this.statusText) { this.statusText.setText('Nation created!'); this.statusText.setColor('#4ade80'); }
      setTimeout(() => this.scene.start('GameScene'), 1000);
    } catch (error: any) {
      if (this.statusText) { this.statusText.setText(error.response?.data?.error || 'Failed'); this.statusText.setColor('#ff4444'); }
    }
  }
}
