// Game Constants

// World Configuration
export const WORLD_WIDTH = 500;
export const WORLD_HEIGHT = 500;
export const TILE_SIZE = 32;
export const CHUNK_SIZE = 32;

// Terrain Types
export const TERRAIN_TYPES = {
  PLAIN: 'PLAIN',
  FOREST: 'FOREST',
  MOUNTAIN: 'MOUNTAIN',
  DESERT: 'DESERT',
  WATER: 'WATER',
  COAST: 'COAST'
} as const;

export type TerrainType = typeof TERRAIN_TYPES[keyof typeof TERRAIN_TYPES];

// Terrain Properties
export const TERRAIN_PROPERTIES: Record<TerrainType, {
  color: string;
  buildable: boolean;
  buildCostMultiplier: number;
  movementCost: number;
  resources: string[];
}> = {
  PLAIN: {
    color: '#87ceeb',
    buildable: true,
    buildCostMultiplier: 1,
    movementCost: 1,
    resources: ['food', 'gold']
  },
  FOREST: {
    color: '#228b22',
    buildable: true,
    buildCostMultiplier: 1.25,
    movementCost: 2,
    resources: ['wood', 'herbs']
  },
  MOUNTAIN: {
    color: '#808080',
    buildable: false,
    buildCostMultiplier: 0,
    movementCost: 0,
    resources: ['stone', 'ore', 'gems']
  },
  DESERT: {
    color: '#f4a460',
    buildable: true,
    buildCostMultiplier: 1.5,
    movementCost: 0.8,
    resources: ['gold']
  },
  WATER: {
    color: '#4169e1',
    buildable: false,
    buildCostMultiplier: 0,
    movementCost: 0,
    resources: []
  },
  COAST: {
    color: '#ffd700',
    buildable: true,
    buildCostMultiplier: 1,
    movementCost: 1,
    resources: ['fish', 'food']
  }
};

// Building Types
export const BUILDING_TYPES = {
  WATER_WELL: 'WATER_WELL',
  FARM: 'FARM',
  LUMBER_MILL: 'LUMBER_MILL',
  STONE_QUARRY: 'STONE_QUARRY',
  MINE: 'MINE',
  MARKET: 'MARKET',
  BARRACKS: 'BARRACKS',
  WALL: 'WALL',
  TOWER: 'TOWER',
  PALACE: 'PALACE'
} as const;

// Action Types
export const ACTION_TYPES = {
  BUILD_BUILDING: 'BUILD_BUILDING',
  UPGRADE_BUILDING: 'UPGRADE_BUILDING',
  CONQUER_TILE: 'CONQUER_TILE',
  SEND_ARMY: 'SEND_ARMY',
  CREATE_TRADE_ROUTE: 'CREATE_TRADE_ROUTE',
  UPDATE_TRADE_ROUTE: 'UPDATE_TRADE_ROUTE',
  SEND_DIPLOMACY_REQUEST: 'SEND_DIPLOMACY_REQUEST',
  RESPOND_DIPLOMACY_REQUEST: 'RESPOND_DIPLOMACY_REQUEST'
} as const;

// Nation Roles
export const NATION_ROLES = {
  LEADER: 'LEADER',
  MEMBER: 'MEMBER'
} as const;

// Diplomacy Status
export const DIPLOMACY_STATUS = {
  NONE: 'NONE',
  ALLY: 'ALLY',
  TRUCE: 'TRUCE',
  WAR: 'WAR'
} as const;

// Camera Settings
export const CAMERA_SETTINGS = {
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2.0,
  DEFAULT_ZOOM: 1.0,
  ZOOM_SPEED: 0.01
};

// UI Colors
export const UI_COLORS = {
  PRIMARY: '#4a90d9',
  SECONDARY: '#2a2a4e',
  BACKGROUND: '#1a1a2e',
  TEXT: '#ffffff',
  TEXT_MUTED: '#888888',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336'
};