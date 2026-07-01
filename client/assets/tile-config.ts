/**
 * Urizen Onebit Tileset v2.0 Configuration
 * Tile size: 16x16 pixels
 * 
 * This maps our terrain types to sprite coordinates in the tileset.
 * Coordinates are (column, row) starting from 0.
 */

export const TILE_SIZE = 16; // pixels
export const TILESET_NAME = 'urizen_onebit_tileset__v2d0';

export interface TileConfig {
  terrain: string;
  color: string;
  // Fallback color if sprite not loaded
  variants: number[]; // Array of frame indices for variety
}

/**
 * Terrain type configurations
 * Frame indices will be determined after examining the tileset layout
 */
export const TERRAIN_CONFIG: Record<string, TileConfig> = {
  PLAIN: {
    terrain: 'PLAIN',
    color: '#4ade80', // green
    variants: [0, 1, 2, 3], // grass tiles
  },
  FOREST: {
    terrain: 'FOREST',
    color: '#166534', // dark green
    variants: [4, 5, 6, 7], // tree tiles
  },
  MOUNTAIN: {
    terrain: 'MOUNTAIN',
    color: '#78716c', // stone gray
    variants: [8, 9, 10, 11], // mountain/rock tiles
  },
  DESERT: {
    terrain: 'DESERT',
    color: '#fbbf24', // sand yellow
    variants: [12, 13, 14, 15], // sand tiles
  },
  WATER: {
    terrain: 'WATER',
    color: '#3b82f6', // blue
    variants: [16, 17, 18, 19], // water tiles
  },
  COAST: {
    terrain: 'COAST',
    color: '#60a5fa', // light blue
    variants: [20, 21, 22, 23], // shore/water edge tiles
  },
};

/**
 * Get a random variant for terrain type
 */
export function getTerrainVariant(terrainType: string): number {
  const config = TERRAIN_CONFIG[terrainType];
  if (!config) return 0;
  
  const variant = config.variants[Math.floor(Math.random() * config.variants.length)];
  return variant;
}

/**
 * Get fallback color for terrain type
 */
export function getTerrainColor(terrainType: string): string {
  const config = TERRAIN_CONFIG[terrainType];
  return config ? config.color : '#888888';
}
