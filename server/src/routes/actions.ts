import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All action routes require authentication
router.use(authenticate);

// Validation schemas
const addActionSchema = z.object({
  type: z.enum(['CONQUER', 'BUILD', 'TRAIN', 'MOVE', 'ATTACK']),
  targetX: z.number().int().min(0).max(499),
  targetY: z.number().int().min(0).max(499),
  data: z.any().optional()
});

// Queue an action
router.post('/queue', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, targetX, targetY, data } = addActionSchema.parse(req.body);
    
    // Check player's action queue limit
    const pendingActions = await prisma.action.count({
      where: {
        playerId: req.user!.id,
        status: 'PENDING'
      }
    });
    
    if (pendingActions >= 10) { // Max 10 pending actions
      res.status(400).json({ error: 'Action queue is full (max 10 pending)' });
      return;
    }
    
    // Create action
    const action = await prisma.action.create({
      data: {
        playerId: req.user!.id,
        type,
        targetX,
        targetY,
        data: data || {},
        status: 'PENDING'
      }
    });
    
    res.status(201).json({ 
      message: 'Action queued',
      action: {
        id: action.id,
        type: action.type,
        targetX: action.targetX,
        targetY: action.targetY,
        status: action.status,
        createdAt: action.createdAt
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Add action error:', error);
      res.status(500).json({ error: 'Failed to queue action' });
    }
  }
});

// Get player's action queue
router.get('/queue', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const actions = await prisma.action.findMany({
      where: { playerId: req.user!.id },
      orderBy: { createdAt: 'asc' },
      take: 20
    });
    
    res.json({ actions });
  } catch (error) {
    console.error('Get actions error:', error);
    res.status(500).json({ error: 'Failed to get actions' });
  }
});

// Cancel an action
router.delete('/queue/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const action = await prisma.action.findFirst({
      where: {
        id: req.params.id,
        playerId: req.user!.id,
        status: 'PENDING'
      }
    });
    
    if (!action) {
      res.status(404).json({ error: 'Action not found or cannot be cancelled' });
      return;
    }
    
    await prisma.action.update({
      where: { id: action.id },
      data: { status: 'CANCELLED' }
    });
    
    res.json({ message: 'Action cancelled' });
  } catch (error) {
    console.error('Cancel action error:', error);
    res.status(500).json({ error: 'Failed to cancel action' });
  }
});

export const setupActionRoutes = (app: express.Application): void => {
  app.use('/api/actions', router);
};