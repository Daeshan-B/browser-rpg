import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Apply optional auth to all world routes
router.use(optionalAuth);

// Validation schemas
const chunkSchema = z.object({
  x: z.number().int().min(0).max(15), // 500 tiles / 32 tiles per chunk = ~16 chunks
  y: z.number().int().min(0).max(15)
});

const tileSchema = z.object({
  x: z.number().int().min(0).max(499),
  y: z.number().int().min(0).max(499)
});

// Get entire world info
router.get('/info', async (req: Request, res: Response): Promise<void> => {
  try {
    const totalTiles = await prisma.tile.count();
    const totalNations = await prisma.nation.count();
    
    res.json({
      world: {
        width: 500,
        height: 500,
        tileSize: 32,
        totalTiles: 250000,
        generatedTiles: totalTiles,
        totalNations
      }
    });
  } catch (error) {
    console.error('Get world info error:', error);
    res.status(500).json({ error: 'Failed to get world info' });
  }
});

// Get a chunk of tiles (32x32 tiles)
router.get('/chunk', async (req: Request, res: Response): Promise<void> => {
  try {
    const { x, y } = chunkSchema.parse(req.query);
    
    const chunkSize = 32;
    const minX = x * chunkSize;
    const minY = y * chunkSize;
    const maxX = minX + chunkSize - 1;
    const maxY = minY + chunkSize - 1;
    
    const tiles = await prisma.tile.findMany({
      where: {
        x: { gte: minX, lte: maxX },
        y: { gte: minY, lte: maxY }
      },
      include: {
        nation: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        buildings: {
          select: {
            id: true,
            type: true,
            level: true
          }
        }
      }
    });
    
    // Create a 2D array for the chunk
    const chunk: any[] = [];
    for (let ty = 0; ty < chunkSize; ty++) {
      const row: any[] = [];
      for (let tx = 0; tx < chunkSize; tx++) {
        const tileX = minX + tx;
        const tileY = minY + ty;
        
        const tile = tiles.find(t => t.x === tileX && t.y === tileY);
        
        row.push({
          x: tileX,
          y: tileY,
          terrain: tile?.terrain || 'PLAIN',
          ownedBy: tile?.nationId || null,
          nation: tile?.nation || null,
          buildings: tile?.buildings || []
        });
      }
      chunk.push(row);
    }
    
    res.json({ chunk, x, y });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Get chunk error:', error);
      res.status(500).json({ error: 'Failed to get chunk' });
    }
  }
});

// Get a single tile
router.get('/tile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { x, y } = tileSchema.parse(req.query);
    
    const tile = await prisma.tile.findUnique({
      where: {
        x_y: { x: parseInt(x as string), y: parseInt(y as string) }
      },
      include: {
        nation: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        buildings: {
          select: {
            id: true,
            type: true,
            level: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!tile) {
      res.status(404).json({ error: 'Tile not found' });
      return;
    }
    
    res.json({ tile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Get tile error:', error);
      res.status(500).json({ error: 'Failed to get tile' });
    }
  }
});

// Get spawn zones
router.get('/spawn-zones', async (req: Request, res: Response): Promise<void> => {
  try {
    const spawnZones = await prisma.spawnZone.findMany({
      select: {
        id: true,
        x: true,
        y: true,
        playerCount: true
      }
    });
    
    // Sort by player count to find least populated
    spawnZones.sort((a, b) => a.playerCount - b.playerCount);
    
    res.json({ spawnZones });
  } catch (error) {
    console.error('Get spawn zones error:', error);
    res.status(500).json({ error: 'Failed to get spawn zones' });
  }
});

export const setupWorldRoutes = (app: express.Application): void => {
  app.use('/api/world', router);
};