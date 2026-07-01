import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All nation routes require authentication
router.use(authenticate);

// Validation schemas
const createNationSchema = z.object({
  name: z.string().min(3).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  spawnX: z.number().int().min(0).max(499),
  spawnY: z.number().int().min(0).max(499)
});

// Create a new nation
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, color, spawnX, spawnY } = createNationSchema.parse(req.body);
    
    // Check if player already has a nation
    const existingMembership = await prisma.nationMember.findFirst({
      where: {
        playerId: req.user!.id,
        role: 'LEADER'
      }
    });
    
    if (existingMembership) {
      res.status(400).json({ 
        error: 'You already lead a nation' 
      });
      return;
    }
    
    // Check if tile is available
    const tile = await prisma.tile.findUnique({
      where: {
        x_y: { x: spawnX, y: spawnY }
      }
    });
    
    if (!tile) {
      res.status(404).json({ error: 'Tile not found' });
      return;
    }
    
    if (tile.nationId) {
      res.status(400).json({ error: 'Tile is already owned' });
      return;
    }
    
    // Check terrain (can't build on water or mountain)
    if (tile.terrain === 'WATER' || tile.terrain === 'MOUNTAIN') {
      res.status(400).json({ error: 'Cannot build nation here' });
      return;
    }
    
    // Create nation
    const nation = await prisma.nation.create({
      data: {
        name,
        color,
        founderId: req.user!.id
      }
    });
    
    // Add player as leader
    await prisma.nationMember.create({
      data: {
        playerId: req.user!.id,
        nationId: nation.id,
        role: 'LEADER',
        joinedAt: new Date()
      }
    });
    
    // Claim starting tile
    await prisma.tile.update({
      where: {
        x_y: { x: spawnX, y: spawnY }
      },
      data: {
        nationId: nation.id
      }
    });
    
    res.status(201).json({
      nation: {
        id: nation.id,
        name: nation.name,
        color: nation.color,
        founderId: nation.founderId
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Create nation error:', error);
      res.status(500).json({ error: 'Failed to create nation' });
    }
  }
});

// Get player's nations
router.get('/my-nations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const memberships = await prisma.nationMember.findMany({
      where: { playerId: req.user!.id },
      include: {
        nation: {
          include: {
            _count: {
              select: { members: true, tiles: true }
            }
          }
        }
      }
    });
    
    res.json({
      nations: memberships.map(m => ({
        nation: m.nation,
        role: m.role,
        joinedAt: m.joinedAt
      }))
    });
  } catch (error) {
    console.error('Get nations error:', error);
    res.status(500).json({ error: 'Failed to get nations' });
  }
});

// Get nation by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const nation = await prisma.nation.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            player: {
              select: {
                id: true,
                username: true,
                avatarColor: true
              }
            }
          }
        },
        tiles: {
          select: {
            x: true,
            y: true,
            terrain: true
          }
        },
        _count: {
          select: { members: true, tiles: true, buildings: true }
        }
      }
    });
    
    if (!nation) {
      res.status(404).json({ error: 'Nation not found' });
      return;
    }
    
    res.json({ nation });
  } catch (error) {
    console.error('Get nation error:', error);
    res.status(500).json({ error: 'Failed to get nation' });
  }
});

export const setupNationRoutes = (app: express.Application): void => {
  app.use('/api/nation', router);
};