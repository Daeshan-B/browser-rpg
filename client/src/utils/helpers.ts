import { WORLD_WIDTH, WORLD_HEIGHT, CHUNK_SIZE } from './constants';

/**
 * Convert world coordinates to chunk coordinates
 */
export function getChunkCoords(x: number, y: number): { chunkX: number; chunkY: number } {
  return {
    chunkX: Math.floor(x / CHUNK_SIZE),
    chunkY: Math.floor(y / CHUNK_SIZE)
  };
}

/**
 * Convert chunk coordinates to world coordinates
 */
export function getChunkOrigin(chunkX: number, chunkY: number): { x: number; y: number } {
  return {
    x: chunkX * CHUNK_SIZE,
    y: chunkY * CHUNK_SIZE
  };
}

/**
 * Check if coordinates are within world bounds
 */
export function isWithinBounds(x: number, y: number): boolean {
  return x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT;
}

/**
 * Calculate distance between two points (Manhattan distance)
 */
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

/**
 * Calculate distance between two points (Euclidean distance)
 */
export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Generate a random color in hex format
 */
export function randomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Get adjacent tile coordinates (4-directional)
 */
export function getAdjacentTiles(x: number, y: number): { x: number; y: number }[] {
  const adjacent = [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 }
  ];
  
  return adjacent.filter(tile => isWithinBounds(tile.x, tile.y));
}

/**
 * Get adjacent tile coordinates (8-directional including diagonals)
 */
export function getAdjacentTiles8(x: number, y: number): { x: number; y: number }[] {
  const adjacent = [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
    { x: x + 1, y: y + 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y + 1 },
    { x: x - 1, y: y - 1 }
  ];
  
  return adjacent.filter(tile => isWithinBounds(tile.x, tile.y));
}