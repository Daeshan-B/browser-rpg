import Phaser from 'phaser';
import { apiClient } from '../api/client';
import { getRandomFrame, getTerrainColor, TILE_SIZE_RENDER } from '../../assets/tile-config';

interface TileData {
  x: number;
  y: number;
  terrain: string;
  nation?: { id: string; name: string; color: string; } | null;
}

export class GameScene extends Phaser.Scene {
  private tiles: Map<string, Phaser.GameObjects.Image> = new Map();
  private CHUNK_SIZE = 32;
  private WORLD_WIDTH = 500;
  private WORLD_HEIGHT = 500;
  private zoom = 1;

  constructor() { super({ key: 'GameScene' }); }

  async create(): Promise<void> {
    // Background
    this.add.graphics().fillStyle(0x0a0a1a, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    
    // UI Elements
    this.add.text(10, 10, 'BrowserRPG World Map', { font: 'bold 20px "Courier New"', color: '#4ade80' }).setScrollFactor(0);
    this.add.text(10, 40, 'WASD/Arrows: Move | +/- : Zoom', { font: '14px "Courier New"', color: '#888888' }).setScrollFactor(0);
    
    const statusText = this.add.text(10, 70, 'Loading world data...', { font: '14px "Courier New"', color: '#fbbf24' }).setScrollFactor(0);
    const coordText = this.add.text(this.scale.width - 150, 10, 'Pos: 0, 0', { font: '14px "Courier New"', color: '#fbbf24' }).setOrigin(0, 0).setScrollFactor(0);

    // Load player's nation to get spawn location
    let playerSpawnX = 250;
    let playerSpawnY = 250;
    let nationColor = '#4a90d9';
    let nationName = '';
    
    try {
      const nationsData = await apiClient.getMyNations();
      const myNation = nationsData.nations?.find((n: any) => n.role === 'LEADER');
      if (myNation) {
        playerSpawnX = myNation.spawnX || 250;
        playerSpawnY = myNation.spawnY || 250;
        nationColor = myNation.color || '#4a90d9';
        nationName = myNation.name || '';
        console.log(`🏰 Your nation: ${nationName} at (${playerSpawnX}, ${playerSpawnY})`);
      }
    } catch (err) { console.error('Failed to load nation:', err); }
    
    // Load world info
    try {
      const worldInfo = await apiClient.getWorldInfo();
      statusText.setText(`Tiles: ${worldInfo.world?.generatedTiles || 0} | Nations: ${worldInfo.world?.totalNations || 0}${nationName ? ` | ${nationName}` : ''}`);
      console.log('🌍 World info loaded');
    } catch (err) { statusText.setText('Error loading world data'); }

    // Center camera
    this.cameras.main.setZoom(this.zoom);
    this.cameras.main.scrollX = (this.WORLD_WIDTH * TILE_SIZE_RENDER) / 2 - this.scale.width / 2;
    this.cameras.main.scrollY = (this.WORLD_HEIGHT * TILE_SIZE_RENDER) / 2 - this.scale.height / 2;

    // Load initial chunks
    const cx = Math.floor((this.WORLD_WIDTH / 2) / this.CHUNK_SIZE);
    const cy = Math.floor((this.WORLD_HEIGHT / 2) / this.CHUNK_SIZE);
    await this.loadChunk(cx, cy);
    
    // Load surrounding chunks
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && nx < 16 && ny >= 0 && ny < 16) this.loadChunk(nx, ny).catch(console.error);
      }
    }

    // Input handlers
    this.input.keyboard?.on('down-UP', () => this.moveCamera(0, -100));
    this.input.keyboard?.on('down-DOWN', () => this.moveCamera(0, 100));
    this.input.keyboard?.on('down-LEFT', () => this.moveCamera(-100, 0));
    this.input.keyboard?.on('down-RIGHT', () => this.moveCamera(100, 0));
    this.input.keyboard?.on('down-PLUS', () => this.zoomIn());
    this.input.keyboard?.on('down-MINUS', () => this.zoomOut());

    // Update loop
    this.events.on('update', () => {
      const wx = Math.floor(this.cameras.main.scrollX / TILE_SIZE_RENDER);
      const wy = Math.floor(this.cameras.main.scrollY / TILE_SIZE_RENDER);
      coordText.setText(`Pos: ${wx}, ${wy} | Zoom: ${this.zoom.toFixed(1)}x | Tiles: ${this.tiles.size}`);
      this.loadVisibleChunks();
      
      // Pulse effect for spawn marker
      if (this.spawnMarker) {
        const scale = 1 + Math.sin(Date.now() / 500) * 0.3;
        this.spawnMarker.setScale(scale);
      }
    });
    
    // Create player spawn marker
    this.createSpawnMarker(playerSpawnX, playerSpawnY, nationColor);
    
    console.log('🎮 GameScene ready with tile sprites!');
  }

  private spawnMarker: Phaser.GameObjects.Graphics | null = null;

  private createSpawnMarker(x: number, y: number, color: string): void {
    const px = x * TILE_SIZE_RENDER + TILE_SIZE_RENDER / 2;
    const py = y * TILE_SIZE_RENDER + TILE_SIZE_RENDER / 2;
    
    // Create a pulsing circle marker
    this.spawnMarker = this.add.graphics();
    const colorInt = parseInt(color.replace('#', ''), 16);
    
    // Outer glow
    this.spawnMarker.fillStyle(0xffffff, 0.3);
    this.spawnMarker.fillCircle(px, py, TILE_SIZE_RENDER);
    
    // Inner circle
    this.spawnMarker.fillStyle(colorInt, 1);
    this.spawnMarker.fillCircle(px, py, TILE_SIZE_RENDER / 2);
    
    // Crown/flag icon (simple triangle)
    this.spawnMarker.fillStyle(0xffffff, 1);
    this.spawnMarker.beginPath();
    this.spawnMarker.moveTo(px - 4, py - 8);
    this.spawnMarker.lineTo(px + 4, py - 8);
    this.spawnMarker.lineTo(px, py - 16);
    this.spawnMarker.closePath();
    this.spawnMarker.fillPath();
    
    console.log(`📍 Spawn marker created at (${x}, ${y})`);
  }

  private async loadChunk(chunkX: number, chunkY: number): Promise<void> {
    try {
      const response = await apiClient.getChunk(chunkX, chunkY);
      if (response.chunk) {
        for (const row of response.chunk) {
          for (const tile of row) { this.renderTile(tile); }
        }
        console.log(`✅ Chunk (${chunkX},${chunkY}) loaded`);
      }
    } catch (err) { console.error(`Failed to load chunk (${chunkX},${chunkY}):`, err); }
  }

  private renderTile(tile: TileData): void {
    const key = `${tile.x},${tile.y}`;
    if (this.tiles.has(key)) return;
    
    // Get random frame for terrain variety
    const frame = getRandomFrame(tile.terrain);
    const color = getTerrainColor(tile.terrain);
    
    const x = tile.x * TILE_SIZE_RENDER + TILE_SIZE_RENDER / 2;
    const y = tile.y * TILE_SIZE_RENDER + TILE_SIZE_RENDER / 2;
    
    let sprite: Phaser.GameObjects.Image;
    
    if (frame) {
      // Use actual sprite from tileset
      const frameIndex = frame.row * 32 + frame.column;
      sprite = this.add.image(x, y, 'tiles', frameIndex);
    } else {
      // Fallback to colored tile
      sprite = this.add.image(x, y, 'tiles', 0);
      sprite.setTint(parseInt(color.replace('#', ''), 16));
    }
    
    sprite.setDisplaySize(TILE_SIZE_RENDER, TILE_SIZE_RENDER);
    
    // Visual indicator for nation ownership
    if (tile.nation) {
      const nationColorInt = parseInt(tile.nation.color.replace('#', ''), 16);
      // Add semi-transparent colored overlay
      const overlay = this.add.graphics();
      overlay.fillStyle(nationColorInt, 0.35);
      overlay.fillRect(x - TILE_SIZE_RENDER / 2, y - TILE_SIZE_RENDER / 2, TILE_SIZE_RENDER, TILE_SIZE_RENDER);
      // Add border for stronger visibility
      overlay.lineStyle(2, nationColorInt, 0.8);
      overlay.strokeRect(x - TILE_SIZE_RENDER / 2, y - TILE_SIZE_RENDER / 2, TILE_SIZE_RENDER, TILE_SIZE_RENDER);
      // Store overlay with tile for cleanup
      (sprite as any).overlay = overlay;
    }
    
    this.tiles.set(key, sprite);
  }

  private loadVisibleChunks(): void {
    const cam = this.cameras.main;
    const vcw = Math.ceil(cam.width / (TILE_SIZE_RENDER * this.zoom * this.CHUNK_SIZE)) + 1;
    const vch = Math.ceil(cam.height / (TILE_SIZE_RENDER * this.zoom * this.CHUNK_SIZE)) + 1;
    const scx = Math.floor(cam.scrollX / (TILE_SIZE_RENDER * this.CHUNK_SIZE));
    const scy = Math.floor(cam.scrollY / (TILE_SIZE_RENDER * this.CHUNK_SIZE));
    
    for (let dy = -1; dy <= vch; dy++) {
      for (let dx = -1; dx <= vcw; dx++) {
        const cx = scx + dx, cy = scy + dy;
        if (cx >= 0 && cx < 16 && cy >= 0 && cy < 16) this.loadChunk(cx, cy).catch(console.error);
      }
    }
  }

  private moveCamera(dx: number, dy: number): void {
    const cam = this.cameras.main;
    const ww = this.WORLD_WIDTH * TILE_SIZE_RENDER;
    const wh = this.WORLD_HEIGHT * TILE_SIZE_RENDER;
    cam.scrollX = Phaser.Math.Clamp(cam.scrollX + dx, 0, ww - cam.width);
    cam.scrollY = Phaser.Math.Clamp(cam.scrollY + dy, 0, wh - cam.height);
  }

  private zoomIn(): void { this.zoom = Math.min(this.zoom * 1.2, 3.0); this.cameras.main.setZoom(this.zoom); this.loadVisibleChunks(); }
  private zoomOut(): void { this.zoom = Math.max(this.zoom / 1.2, 0.5); this.cameras.main.setZoom(this.zoom); this.loadVisibleChunks(); }
  update(): void {}
}
