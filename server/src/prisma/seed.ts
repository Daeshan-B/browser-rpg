import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// World configuration
const WORLD_WIDTH = 500;
const WORLD_HEIGHT = 500;
const CHUNK_SIZE = 32;
const SPAWN_ZONE_SIZE = 10;
const NUM_SPAWN_ZONES = 15;

// Terrain distribution (percentage)
const TERRAIN_DISTRIBUTION = {
  PLAIN: 0.40,
  FOREST: 0.20,
  MOUNTAIN: 0.15,
  DESERT: 0.10,
  WATER: 0.10,
  COAST: 0.05
};

// Terrain types
type TerrainType = 'PLAIN' | 'FOREST' | 'MOUNTAIN' | 'DESERT' | 'WATER' | 'COAST';

/**
 * Generate terrain based on weighted random distribution
 */
function generateTerrain(): TerrainType {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [terrain, probability] of Object.entries(TERRAIN_DISTRIBUTION)) {
    cumulative += probability;
    if (rand <= cumulative) {
      return terrain as TerrainType;
    }
  }
  
  return 'PLAIN'; // fallback
}

/**
 * Calculate spawn zone positions (evenly distributed)
 */
function calculateSpawnZones(): { x: number; y: number }[] {
  const zones: { x: number; y: number }[] = [];
  const spacingX = Math.floor(WORLD_WIDTH / (NUM_SPAWN_ZONES * 0.5));
  const spacingY = Math.floor(WORLD_HEIGHT / (NUM_SPAWN_ZONES * 0.5));
  
  for (let i = 0; i < NUM_SPAWN_ZONES; i++) {
    // Create a grid-like distribution with some randomness
    const gridX = i % Math.ceil(Math.sqrt(NUM_SPAWN_ZONES));
    const gridY = Math.floor(i / Math.ceil(Math.sqrt(NUM_SPAWN_ZONES)));
    
    const x = (gridX * spacingX) + Math.floor(Math.random() * 20);
    const y = (gridY * spacingY) + Math.floor(Math.random() * 20);
    
    // Ensure within bounds
    zones.push({
      x: Math.max(0, Math.min(x, WORLD_WIDTH - SPAWN_ZONE_SIZE)),
      y: Math.max(0, Math.min(y, WORLD_HEIGHT - SPAWN_ZONE_SIZE))
    });
  }
  
  return zones;
}

/**
 * Generate spawn zone tiles (safe starting areas)
 */
async function createSpawnZones(spawnZones: { x: number; y: number }[]): Promise<void> {
  console.log(`Creating ${spawnZones.length} spawn zones...`);
  
  for (const zone of spawnZones) {
    // Create spawn zone record
    await prisma.spawnZone.create({
      data: { x: zone.x, y: zone.y }
    });
    
    // Create safe tiles around spawn zone (mostly plains with some water wells)
    for (let dy = 0; dy < SPAWN_ZONE_SIZE; dy++) {
      for (let dx = 0; dx < SPAWN_ZONE_SIZE; dx++) {
        const tileX = zone.x + dx;
        const tileY = zone.y + dy;
        
        // Ensure spawn zones are buildable terrain
        const terrain = Math.random() < 0.85 ? 'PLAIN' : 'COAST';
        
        await prisma.tile.create({
          data: {
            x: tileX,
            y: tileY,
            terrain
          }
        });
      }
    }
  }
  
  console.log('✓ Spawn zones created');
}

/**
 * Generate the rest of the world tiles
 */
async function generateWorldTiles(spawnZoneTiles: Set<string>): Promise<void> {
  console.log('Generating world tiles...');
  
  const batchSize = 1000;
  let created = 0;
  
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const key = `${x},${y}`;
      
      // Skip if already created (spawn zones)
      if (spawnZoneTiles.has(key)) {
        continue;
      }
      
      const terrain = generateTerrain();
      
      await prisma.tile.create({
        data: { x, y, terrain }
      });
      
      created++;
      
      // Progress update every batch
      if (created % batchSize === 0) {
        const progress = Math.round((created / (WORLD_WIDTH * WORLD_HEIGHT)) * 100);
        console.log(`  Progress: ${progress}% (${created}/${WORLD_WIDTH * WORLD_HEIGHT})`);
      }
    }
  }
  
  console.log(`✓ Generated ${created} world tiles`);
}

/**
 * Main seed function
 */
async function main(): Promise<void> {
  console.log('🌍 Starting world generation...\n');
  
  try {
    // Clean existing data (for re-seeding)
    console.log('Cleaning existing data...');
    await prisma.tile.deleteMany();
    await prisma.spawnZone.deleteMany();
    console.log('✓ Cleaned existing data\n');
    
    // Calculate spawn zone positions
    const spawnZones = calculateSpawnZones();
    console.log(`Calculated ${spawnZones.length} spawn zone positions\n`);
    
    // Track spawn zone tiles
    const spawnZoneTiles = new Set<string>();
    
    // Create spawn zones first
    await createSpawnZones(spawnZones);
    
    // Mark spawn zone tiles
    for (const zone of spawnZones) {
      for (let dy = 0; dy < SPAWN_ZONE_SIZE; dy++) {
        for (let dx = 0; dx < SPAWN_ZONE_SIZE; dx++) {
          spawnZoneTiles.add(`${zone.x + dx},${zone.y + dy}`);
        }
      }
    }
    
    // Generate rest of the world
    await generateWorldTiles(spawnZoneTiles);
    
    // Summary
    const totalTiles = await prisma.tile.count();
    const totalSpawnZones = await prisma.spawnZone.count();
    
    console.log('\n📊 World Generation Summary:');
    console.log(`  Total tiles: ${totalTiles}`);
    console.log(`  Spawn zones: ${totalSpawnZones}`);
    console.log(`  World size: ${WORLD_WIDTH}x${WORLD_HEIGHT} (${WORLD_WIDTH * WORLD_HEIGHT} tiles)\n`);
    
    console.log('✨ World generation complete!');
  } catch (error) {
    console.error('❌ Error during world generation:', error);
    throw error;
  }
}

// Run seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });