import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All trade routes require authentication
router.use(authenticate);

// Validation schemas
const createTradeRouteSchema = z.object({
  nationId: z.string().uuid(),
  sourceTileX: z.number().int().min(0).max(499),
  sourceTileY: z.number().int().min(0).max(499),
  targetTileX: z.number().int().min(0).max(499),
  targetTileY: z.number().int().min(0).max(499)
});

// Create a trade route
router.post('/routes', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nationId, sourceTileX, sourceTileY, targetTileX, targetTileY } = 
      createTradeRouteSchema.parse(req.body);
    
    // Verify player is part of the nation
    const membership = await prisma.nationMember.findFirst({
      where: {
        playerId: req.user!.id,
        nationId,
        role: { in: ['LEADER', 'ADMIN'] }
      }
    });
    
    if (!membership) {
      res.status(403).json({ error: 'Not authorized to create trade routes for this nation' });
      return;
    }
    
    // TODO: Implement trade route creation logic
    // This will need pathfinding and validation
    
    res.status(201).json({ 
      message: 'Trade route creation initiated',
      // TODO: Return trade route details
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Create trade route error:', error);
      res.status(500).json({ error: 'Failed to create trade route' });
    }
  }
});

// Get nation's trade routes
router.get('/routes/:nationId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tradeRoutes = await prisma.tradeRoute.findMany({
      where: { nationId: req.params.nationId },
      include: {
        sourceTile: true,
        targetTile: true
      }
    });
    
    res.json({ tradeRoutes });
  } catch (error) {
    console.error('Get trade routes error:', error);
    res.status(500).json({ error: 'Failed to get trade routes' });
  }
});

export const setupTradeRoutes = (app: express.Application): void => {
  app.use('/api/trade', router);
};