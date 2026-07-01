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
  private selectedTile: TileData | null = null;
  private selectedTileSprite: Phaser.GameObjects.Image | null = null;
  private CHUNK_SIZE = 32;
  private WORLD_WIDTH = 500;
  private WORLD_HEIGHT = 500;
  private zoom = 1;
  private actionMenu: Phaser.GameObjects.Container | null = null;
  private actionButton: Phaser.GameObjects.Text | null = null;
  private closeActionButton: Phaser.GameObjects.Text | null = null;

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

    // Input handlers - keyboard
    this.input.keyboard?.on('down-UP', () => this.moveCamera(0, -100));
    this.input.keyboard?.on('down-DOWN', () => this.moveCamera(0, 100));
    this.input.keyboard?.on('down-LEFT', () => this.moveCamera(-100, 0));
    this.input.keyboard?.on('down-RIGHT', () => this.moveCamera(100, 0));
    this.input.keyboard?.on('down-PLUS', () => this.zoomIn());
    this.input.keyboard?.on('down-MINUS', () => this.zoomOut());
    
    // Input handlers - mouse (tile selection)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleTileClick(pointer));
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.handleTileHover(pointer));
    this.input.on('pointerup', () => this.closeActionMenu());

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
    
    // Create action menu UI
    this.createActionMenu();
    
    console.log('🎮 GameScene ready with tile sprites!');
  }
  
  private createActionMenu(): void {
    // Create a dark semi-transparent background
    this.actionMenu = this.add.container(0, 0);
    
    // Dark background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(10, 100, 300, 180);
    this.actionMenu?.add(bg);
    
    // Title
    const title = this.add.text(20, 15, 'Tile Actions', { 
      font: 'bold 18px "Courier New"', 
      color: '#ffffff' 
    }).setScrollFactor(0);
    this.actionMenu?.add(title);
    
    // Action button
    this.actionButton = this.add.text(20, 50, 'Conquer Tile (C)', { 
      font: '14px "Courier New"', 
      color: '#4ade80',
      backgroundColor: 'rgba(74, 222, 128, 0.2)'
    }).setScrollFactor(0);
    this.actionButton.setInteractive({ useHandCursor: true });
    this.actionButton.on('pointerover', () => this.actionButton?.setTint(0x4ade80));
    this.actionButton.on('pointerout', () => this.actionButton?.clearTint());
    this.actionButton.on('pointerdown', () => this.conquerTile());
    this.actionMenu?.add(this.actionButton);
    
    // Close button
    this.closeActionButton = this.add.text(20, 150, 'Close (Esc)', { 
      font: '14px "Courier New"', 
      color: '#fbbf24',
      backgroundColor: 'rgba(251, 191, 36, 0.2)'
    }).setScrollFactor(0);
    this.closeActionButton.setInteractive({ useHandCursor: true });
    this.closeActionButton.on('pointerover', () => this.closeActionButton?.setTint(0xfbbf24));
    this.closeActionButton.on('pointerout', () => this.closeActionButton?.clearTint());
    this.closeActionButton.on('pointerdown', () => this.closeActionMenu());
    this.actionMenu?.add(this.closeActionButton);
  }
  
  private handleTileClick(pointer: Phaser.Input.Pointer): void {
    // Convert screen coordinates to world coordinates
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    
    const tileX = Math.floor((worldX - TILE_SIZE_RENDER / 2) / TILE_SIZE_RENDER);
    const tileY = Math.floor((worldY - TILE_SIZE_RENDER / 2) / TILE_SIZE_RENDER);
    
    // Check if tile exists in our tiles map
    const key = `${tileX},${tileY}`;
    const sprite = this.tiles.get(key);
    
    if (sprite) {
      // Check if tile is owned by another nation
      if (sprite.getData('overlay')) {
        this.showTileInfo(tileX, tileY);
        return;
      }
      
      this.selectTile(tileX, tileY);
    } else {
      console.log('Tile not found at', tileX, tileY);
    }
  }
  
  private handleTileHover(pointer: Phaser.Input.Pointer): void {
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    
    const tileX = Math.floor((worldX - TILE_SIZE_RENDER / 2) / TILE_SIZE_RENDER);
    const tileY = Math.floor((worldY - TILE_SIZE_RENDER / 2) / TILE_SIZE_RENDER);
    
    const key = `${tileX},${tileY}`;
    const sprite = this.tiles.get(key);
    
    if (sprite) {
      if (this.selectedTileSprite) {
        this.selectedTileSprite.clearTint();
      }
      
      if (sprite.getData('overlay')) {
        sprite.setTint(0xffaa00); // Orange for owned by others
        this.showTileInfo(tileX, tileY);
      } else if (this.selectedTile) {
        sprite.setTint(0x4ade80); // Green for selected
      } else {
        sprite.setTint(0x66bb66); // Light green for hover
      }
      
      this.selectedTileSprite = sprite;
    } else {
      if (this.selectedTileSprite) {
        this.selectedTileSprite.clearTint();
      }
      this.selectedTileSprite = null;
    }
  }
  
  private selectTile(tileX: number, tileY: number): void {
    this.selectedTile = { x: tileX, y: tileY, terrain: 'PLAIN' };
    this.updateActionMenu();
  }
  
  private closeActionMenu(): void {
    if (this.actionMenu) {
      this.actionMenu.destroy();
      this.actionMenu = null;
    }
    this.selectedTile = null;
    this.selectedTileSprite?.clearTint();
    this.selectedTileSprite = null;
  }
  
  private updateActionMenu(): void {
    if (!this.actionButton || !this.closeActionButton || !this.actionMenu) return;
    
    let terrainName = 'Unknown';
    let conquerMessage = '';
    
    switch (this.selectedTile?.terrain) {
      case 'PLAIN': terrainName = 'Grain Plains'; break;
      case 'FOREST': terrainName = 'Dense Forest'; break;
      case 'MOUNTAIN': terrainName = 'Mountain'; break;
      case 'DESERT': terrainName = 'Desert'; break;
      case 'WATER': terrainName = 'Water'; break;
      case 'COAST': terrainName = 'Coast'; break;
    }
    
    const tileKey = `${this.selectedTile?.x},${this.selectedTile?.y}`;
    const tileData = this.tiles.get(tileKey);
    
    if (tileData) {
      conquerMessage = tileData.getData('overlay') ? 'Owned by another nation!' : 'Ready to conquer';
    }
    
    this.actionButton.setText(`Conquer ${terrainName} (C)\n${conquerMessage}`);
  }
  
  private showTileInfo(x: number, y: number): void {
    if (!this.actionButton) return;
    
    const key = `${x},${y}`;
    const tileData = this.tiles.get(key);
    let nationName = 'None';
    
    if (tileData) {
      const nation = tileData.getData('nation');
      nationName = nation ? nation.name : 'None';
    }
    
    this.actionButton.setText(`Tile: (${x}, ${y})\nOwner: ${nationName}`);
  }
  
  private conquerTile(): void {
    if (!this.selectedTile) return;
    
    const { x, y } = this.selectedTile;
    console.log(`🏰 Conquering tile (${x}, ${y})`);
    
    // TODO: Call API to conquer tile
    // For now, just show feedback
    this.closeActionMenu();
    alert(`Conquered tile (${x}, ${y})!`);
    
    // TODO: Update tile ownership in database and UI
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
      sprite.setData('overlay', overlay);
      sprite.setData('nation', tile.nation);
    }
    
    this.tiles.set(key, sprite);
  }
  
  private cleanupTile(key: string): void {
    const sprite = this.tiles.get(key);
    if (sprite) {
      const overlay = sprite.getData('overlay');
      if (overlay) {
        overlay.destroy();
      }
      sprite.destroy();
      this.tiles.delete(key);
    }
  }

  private loadVisibleChunks(): void {
    const cam = this.cameras.main;
    const vcw = Math.ceil(cam.width / (TILE_SIZE_RENDER * this.zoom * this.CHUNK_SIZE)) + 1;
    const vch = Math.ceil(cam.height / (TILE_SIZE_RENDER * this.zoom * this.CHUNK_SIZE)) + 1;
    const scx = Math.floor(cam.scrollX / (TILE_SIZE_RENDER * this.CHUNK_SIZE));
    const scy = Math.floor(cam.scrollY / (TILE_SIZE_RENDER * this.CHUNK_SIZE));
    
    // Cleanup tiles outside view
    for (const [key] of this.tiles) {
      const [tx, ty] = key.split(',').map(Number);
      if (tx < scx - vcw || tx >= scx + vcw || ty < scy - vch || ty >= scy + vch) {
        this.cleanupTile(key);
      }
    }
    
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
