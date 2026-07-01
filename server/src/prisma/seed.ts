import { PrismaClient, TerrainType as TerrainTypeEnum } from '@prisma/client';

const prisma = new PrismaClient();

// World configuration
const WORLD_WIDTH = 500;
const WORLD_HEIGHT = 500;
const SPAWN_ZONE_SIZE = 10;
const NUM_SPAWN_ZONES = 15;

// Terrain distribution (percentage)
const TERRAIN_DISTRIBUTION = [
  { type: 'PLAIN', weight: 0.40 },
  { type: 'FOREST', weight: 0.20 },
  { type: 'MOUNTAIN', weight: 0.15 },
  { type: 'DESERT', weight: 0.10 },
  { type: 'WATER', weight: 0.10 },
  { type: 'COAST', weight: 0.05 },
] as const;

type TerrainType = keyof typeof TerrainTypeEnum;

/**
 * Generate terrain based on weighted random distribution
 */
function generateTerrain(): TerrainType {
  const rand = Math.random();
  let cumulative = 0;

  for (const { type, weight } of TERRAIN_DISTRIBUTION) {
    cumulative += weight;
    if (rand <= cumulative) {
      return type as TerrainType;
    }
  }

  return 'PLAIN';
}

/**
 * Calculate spawn zone positions (evenly distributed)
 */
function calculateSpawnZones(): { x: number; y: number }[] {
  const zones: { x: number; y: number }[] = [];
  const cols = Math.ceil(Math.sqrt(NUM_SPAWN_ZONES));
  const spacingX = Math.floor(WORLD_WIDTH / cols);
  const spacingY = Math.floor(WORLD_HEIGHT / Math.ceil(NUM_SPAWN_ZONES / cols));

  for (let i = 0; i < NUM_SPAWN_ZONES; i++) {
    const gridX = i % cols;
    const gridY = Math.floor(i / cols);

    const x = (gridX * spacingX) + Math.floor(Math.random() * 20);
    const y = (gridY * spacingY) + Math.floor(Math.random() * 20);

    zones.push({
      x: Math.max(0, Math.min(x, WORLD_WIDTH - SPAWN_ZONE_SIZE)),
      y: Math.max(0, Math.min(y, WORLD_HEIGHT - SPAWN_ZONE_SIZE)),
    });
  }

  return zones;
}

/**
 * Generate all tiles and batch insert them
 */
async function generateWorld(spawnZones: { x: number; y: number }[]): Promise<void> {
  console.log('Generating world tiles...');

  const spawnZoneTiles = new Set<string>();

  // Mark spawn zone tiles
  for (const zone of spawnZones) {
    for (let dy = 0; dy < SPAWN_ZONE_SIZE; dy++) {
      for (let dx = 0; dx < SPAWN_ZONE_SIZE; dx++) {
        spawnZoneTiles.add(`${zone.x + dx},${zone.y + dy}`);
      }
    }
  }

  // Generate all tiles
  const tiles: { x: number; y: number; terrain: TerrainType }[] = [];

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const key = `${x},${y}`;

      // Spawn zones get safe terrain
      if (spawnZoneTiles.has(key)) {
        tiles.push({ x, y, terrain: Math.random() < 0.85 ? 'PLAIN' : 'COAST' });
      } else {
        tiles.push({ x, y, terrain: generateTerrain() });
      }
    }

    // Progress per row
    if ((y + 1) % 50 === 0) {
      const progress = Math.round(((y + 1) / WORLD_HEIGHT) * 100);
      console.log(`  Progress: ${progress}% (row ${y + 1}/${WORLD_HEIGHT})`);
    }
  }

  console.log(`Inserting ${tiles.length} tiles into database...`);

  // Batch insert in transactions of 5000
  const batchSize = 5000;
  for (let i = 0; i < tiles.length; i += batchSize) {
    const batch = tiles.slice(i, i + batchSize);
    await prisma.tile.createMany({
      data: batch,
    });

    const progress = Math.round(((i + batchSize) / tiles.length) * 100);
    console.log(`  Inserted: ${progress}% (${Math.min(i + batchSize, tiles.length)}/${tiles.length})`);
  }
}

/**
 * Main seed function
 */
async function main(): Promise<void> {
  console.log('🌍 Starting world generation...\n');

  try {
    // Clean existing data
    console.log('Cleaning existing data...');
    await prisma.tile.deleteMany();
    await prisma.spawnZone.deleteMany();
    console.log('✓ Cleaned existing data\n');

    // Create spawn zones
    const spawnZones = calculateSpawnZones();
    console.log(`Creating ${spawnZones.length} spawn zones...`);

    await prisma.spawnZone.createMany({
      data: spawnZones.map((z) => ({ x: z.x, y: z.y })),
    });
    console.log('✓ Spawn zones created\n');

    // Generate world
    await generateWorld(spawnZones);

    // Summary
    const totalTiles = await prisma.tile.count();
    const totalSpawnZones = await prisma.spawnZone.count();

    // Terrain breakdown
    const terrainCounts: Record<string, number> = {};
    for (const { type } of TERRAIN_DISTRIBUTION) {
      const count = await prisma.tile.count({
        where: { terrain: type as TerrainTypeEnum },
      });
      terrainCounts[type] = count;
    }

    console.log('\n📊 World Generation Summary:');
    console.log(`  Total tiles: ${totalTiles.toLocaleString()}`);
    console.log(`  Spawn zones: ${totalSpawnZones}`);
    console.log(`  World size: ${WORLD_WIDTH}x${WORLD_HEIGHT} (${(WORLD_WIDTH * WORLD_HEIGHT).toLocaleString()} tiles)`);
    console.log('\n  Terrain distribution:');
    for (const [type, count] of Object.entries(terrainCounts)) {
      const pct = ((count / totalTiles) * 100).toFixed(1);
      console.log(`    ${type.padEnd(10)} ${count.toLocaleString().padStart(8)} (${pct}%)`);
    }

    console.log('\n✨ World generation complete!');
  } catch (error) {
    console.error('❌ Error during world generation:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
