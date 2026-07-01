import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function addSampleData() {
  console.log('📦 Adding sample test data...\n');

  try {
    // Check if sample player already exists
    let player = await prisma.player.findUnique({
      where: { email: 'test@example.com' },
    });

    if (player) {
      console.log('✅ Sample player already exists:');
      console.log(`  Username: ${player.username}`);
      console.log(`  Email: ${player.email}`);
      console.log(`  ID: ${player.id}\n`);
    } else {
      // Create sample player
      console.log('Creating sample player...');
      const passwordHash = await bcrypt.hash('password123', 10);

      player = await prisma.player.create({
        data: {
          username: 'TestPlayer',
          email: 'test@example.com',
          passwordHash,
          avatarColor: '#4a90d9',
          gold: 1000,
          wood: 500,
          stone: 500,
          food: 1000,
          gems: 0,
        },
      });
      console.log(`  ✅ Player: ${player.username} (${player.email})`);
      console.log(`     ID: ${player.id}`);
      console.log(`     Password: password123\n`);
    }

    // Check if player has a nation
    let nation = await prisma.nation.findFirst({
      where: { founderId: player.id },
    });

    if (nation) {
      console.log('✅ Sample nation already exists:');
      console.log(`  Name: ${nation.name}`);
      console.log(`  ID: ${nation.id}\n`);
    } else {
      // Create sample nation
      console.log('Creating sample nation...');
      nation = await prisma.nation.create({
        data: {
          name: 'Test Kingdom',
          color: '#e74c3c',
          founderId: player.id,
        },
      });
      console.log(`  ✅ Nation: ${nation.name}`);
      console.log(`     ID: ${nation.id}\n`);

      // Add player as nation leader
      console.log('Adding player as nation leader...');
      await prisma.nationMember.create({
        data: {
          playerId: player.id,
          nationId: nation.id,
          role: 'LEADER',
        },
      });
      console.log('  ✅ Player is now LEADER of nation\n');

      // Claim a tile near a spawn zone
      console.log('Claiming starter tile...');
      const spawnZone = await prisma.spawnZone.findFirst();
      if (spawnZone) {
        const tile = await prisma.tile.upsert({
          where: {
            x_y: { x: spawnZone.x + 5, y: spawnZone.y + 5 },
          },
          update: {
            nationId: nation.id,
          },
          create: {
            x: spawnZone.x + 5,
            y: spawnZone.y + 5,
            terrain: 'PLAIN',
            nationId: nation.id,
          },
        });
        console.log(`  ✅ Tile claimed at (${tile.x}, ${tile.y})`);

        // Add a water well
        await prisma.building.create({
          data: {
            type: 'WATER_WELL',
            level: 1,
            tileId: tile.id,
            nationId: nation.id,
          },
        });
        console.log(`  ✅ Water Well built on tile\n`);
      }
    }

    // Summary
    console.log('📊 Sample Data Summary:');
    console.log(`  Players: ${await prisma.player.count()}`);
    console.log(`  Nations: ${await prisma.nation.count()}`);
    console.log(`  Tiles owned: ${await prisma.tile.count({ where: { nationId: nation!.id } })}`);
    console.log(`  Buildings: ${await prisma.building.count({ where: { nationId: nation!.id } })}`);
    console.log('\n✨ Sample data ready!');
    console.log('\n🔐 Login credentials:');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: password123`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();
