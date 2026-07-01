/**
 * Urizen Onebit Tileset v2.0 Configuration
 * Tile size: 16x16 pixels (source), 32x32 pixels (rendered)
 * 
 * Sprite Frame Mapping
 * The tileset is organized in sections. Each terrain type has multiple
 * variant frames for visual variety when rendering the world map.
 */

export const TILE_SIZE_SOURCE = 16; // Original tile size
export const TILE_SIZE_RENDER = 32; // Rendered size (2x scale)
export const TILESET_NAME = 'tileset';

export interface SpriteFrame {
  column: number; // Column in tileset (0-indexed)
  row: number;    // Row in tileset (0-indexed)
}

export interface TerrainConfig {
  name: string;
  color: string;        // Fallback color
  frames: SpriteFrame[]; // Multiple frames for variety
  description: string;
}

/**
 * Terrain type configurations with actual tileset frame coordinates
 * Based on Urizen Onebit Tileset v2.0 layout
 */
export const TERRAIN_CONFIG: Record<string, TerrainConfig> = {
  PLAIN: {
    name: 'PLAIN',
    color: '#4ade80',
    description: 'Grass plains - moderate resources, buildable',
    frames: [
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 2, row: 0 },
      { column: 3, row: 0 },
    ],
  },
  FOREST: {
    name: 'FOREST',
    color: '#166534',
    description: 'Dense forest - wood resources, slowed movement',
    frames: [
      { column: 0, row: 1 },
      { column: 1, row: 1 },
      { column: 2, row: 1 },
      { column: 3, row: 1 },
    ],
  },
  MOUNTAIN: {
    name: 'MOUNTAIN',
    color: '#78716c',
    description: 'Mountain terrain - stone/ore, impassable to armies',
    frames: [
      { column: 0, row: 2 },
      { column: 1, row: 2 },
      { column: 2, row: 2 },
      { column: 3, row: 2 },
    ],
  },
  DESERT: {
    name: 'DESERT',
    color: '#fbbf24',
    description: 'Arid desert - low resources, fast movement',
    frames: [
      { column: 0, row: 3 },
      { column: 1, row: 3 },
      { column: 2, row: 3 },
      { column: 3, row: 3 },
    ],
  },
  WATER: {
    name: 'WATER',
    color: '#3b82f6',
    description: 'Deep water - impassable, no building',
    frames: [
      { column: 0, row: 4 },
      { column: 1, row: 4 },
      { column: 2, row: 4 },
      { column: 3, row: 4 },
    ],
  },
  COAST: {
    name: 'COAST',
    color: '#60a5fa',
    description: 'Coastal shore - fish resources, buildable',
    frames: [
      { column: 0, row: 5 },
      { column: 1, row: 5 },
      { column: 2, row: 5 },
      { column: 3, row: 5 },
    ],
  },
};

/**
 * Get frame index from column/row coordinates
 * Tileset has ~32 columns, calculate frame index
 */
export function getFrameIndex(column: number, row: number): number {
  return row * 32 + column;
}

/**
 * Get a random frame for terrain type
 */
export function getRandomFrame(terrainType: string): SpriteFrame | null {
  const config = TERRAIN_CONFIG[terrainType];
  if (!config || config.frames.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * config.frames.length);
  return config.frames[randomIndex];
}

/**
 * Get fallback color for terrain type
 */
export function getTerrainColor(terrainType: string): string {
  const config = TERRAIN_CONFIG[terrainType];
  return config ? config.color : '#888888';
}

/**
 * Get terrain configuration
 */
export function getTerrainConfig(terrainType: string): TerrainConfig | null {
  return TERRAIN_CONFIG[terrainType] || null;
}

/**
 * All terrain types
 */
export const TERRAIN_TYPES = Object.keys(TERRAIN_CONFIG);
