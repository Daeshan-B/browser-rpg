import Phaser from 'phaser';
import { apiClient } from '../api/client';
import { getTerrainColor } from '../../assets/tile-config';

interface TileData { x: number; y: number; terrain: string; nation?: { id: string; name: string; color: string; } | null; }

export class GameScene extends Phaser.Scene {
  private tiles: Map<string, Phaser.GameObjects.Image> = new Map();
  private TILE_SIZE = 32;
  private WORLD_WIDTH = 500;
  private WORLD_HEIGHT = 500;
  private CHUNK_SIZE = 32;
  private zoom = 1;

  constructor() { super({ key: 'GameScene' }); }

  async create(): Promise<void> {
    this.add.graphics().fillStyle(0x0a0a1a, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.add.text(10, 10, 'BrowserRPG World Map', { font: 'bold 20px "Courier New"', color: '#4ade80' }).setScrollFactor(0);
    this.add.text(10, 40, 'WASD/Arrows: Move | +/- : Zoom', { font: '14px "Courier New"', color: '#888888' }).setScrollFactor(0);
    
    const statusText = this.add.text(10, 70, 'Loading world data...', { font: '14px "Courier New"', color: '#fbbf24' }).setScrollFactor(0);
    const coordText = this.add.text(this.scale.width - 150, 10, 'Pos: 0, 0', { font: '14px "Courier New"', color: '#fbbf24' }).setOrigin(0, 0).setScrollFactor(0);

    try {
      const worldInfo = await apiClient.getWorldInfo();
      statusText.setText(`Tiles: ${worldInfo.world?.generatedTiles || 0} | Nations: ${worldInfo.world?.totalNations || 0}`);
      console.log('🌍 World info loaded');
    } catch (err) { statusText.setText('Error loading world data'); }

    this.cameras.main.setZoom(this.zoom);
    this.cameras.main.scrollX = (this.WORLD_WIDTH * this.TILE_SIZE) / 2 - this.scale.width / 2;
    this.cameras.main.scrollY = (this.WORLD_HEIGHT * this.TILE_SIZE) / 2 - this.scale.height / 2;

    const cx = Math.floor((this.WORLD_WIDTH / 2) / this.CHUNK_SIZE);
    const cy = Math.floor((this.WORLD_HEIGHT / 2) / this.CHUNK_SIZE);
    await this.loadChunk(cx, cy);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && nx < 16 && ny >= 0 && ny < 16) this.loadChunk(nx, ny).catch(console.error);
      }
    }

    this.input.keyboard?.on('down-UP', () => this.moveCamera(0, -100));
    this.input.keyboard?.on('down-DOWN', () => this.moveCamera(0, 100));
    this.input.keyboard?.on('down-LEFT', () => this.moveCamera(-100, 0));
    this.input.keyboard?.on('down-RIGHT', () => this.moveCamera(100, 0));
    this.input.keyboard?.on('down-PLUS', () => this.zoomIn());
    this.input.keyboard?.on('down-MINUS', () => this.zoomOut());

    this.events.on('update', () => {
      const wx = Math.floor(this.cameras.main.scrollX / this.TILE_SIZE);
      const wy = Math.floor(this.cameras.main.scrollY / this.TILE_SIZE);
      coordText.setText(`Pos: ${wx}, ${wy} | Zoom: ${this.zoom.toFixed(1)}x`);
      this.loadVisibleChunks();
    });
    console.log('🎮 GameScene ready!');
  }

  private async loadChunk(chunkX: number, chunkY: number): Promise<void> {
    try {
      const response = await apiClient.getChunk(chunkX, chunkY);
      if (response.chunk) {
        for (const row of response.chunk) { for (const tile of row) { this.renderTile(tile); } }
        console.log(`✅ Chunk (${chunkX},${chunkY}) loaded`);
      }
    } catch (err) { console.error(`Failed to load chunk (${chunkX},${chunkY}):`, err); }
  }

  private renderTile(tile: TileData): void {
    const key = `${tile.x},${tile.y}`;
    if (this.tiles.has(key)) return;
    const color = getTerrainColor(tile.terrain);
    const sprite = this.add.image(tile.x * this.TILE_SIZE + this.TILE_SIZE / 2, tile.y * this.TILE_SIZE + this.TILE_SIZE / 2, 'tileset')
      .setDisplaySize(this.TILE_SIZE, this.TILE_SIZE).setTint(parseInt(color.replace('#', ''), 16));
    this.tiles.set(key, sprite);
  }

  private loadVisibleChunks(): void {
    const cam = this.cameras.main;
    const vcw = Math.ceil(cam.width / (this.TILE_SIZE * this.zoom * this.CHUNK_SIZE)) + 1;
    const vch = Math.ceil(cam.height / (this.TILE_SIZE * this.zoom * this.CHUNK_SIZE)) + 1;
    const scx = Math.floor(cam.scrollX / (this.TILE_SIZE * this.CHUNK_SIZE));
    const scy = Math.floor(cam.scrollY / (this.TILE_SIZE * this.CHUNK_SIZE));
    for (let dy = -1; dy <= vch; dy++) {
      for (let dx = -1; dx <= vcw; dx++) {
        const cx = scx + dx, cy = scy + dy;
        if (cx >= 0 && cx < 16 && cy >= 0 && cy < 16) this.loadChunk(cx, cy).catch(console.error);
      }
    }
  }

  private moveCamera(dx: number, dy: number): void {
    const cam = this.cameras.main;
    const ww = this.WORLD_WIDTH * this.TILE_SIZE;
    const wh = this.WORLD_HEIGHT * this.TILE_SIZE;
    cam.scrollX = Phaser.Math.Clamp(cam.scrollX + dx, 0, ww - cam.width);
    cam.scrollY = Phaser.Math.Clamp(cam.scrollY + dy, 0, wh - cam.height);
  }

  private zoomIn(): void { this.zoom = Math.min(this.zoom * 1.2, 3.0); this.cameras.main.setZoom(this.zoom); this.loadVisibleChunks(); }
  private zoomOut(): void { this.zoom = Math.max(this.zoom / 1.2, 0.5); this.cameras.main.setZoom(this.zoom); this.loadVisibleChunks(); }
  update(): void {}
}
