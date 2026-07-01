import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All diplomacy routes require authentication
router.use(authenticate);

// Validation schemas
const diplomacyActionSchema = z.object({
  targetNationId: z.string().uuid(),
  action: z.enum(['ALLIANCE', 'TRUCE', 'WAR', 'NEUTRAL'])
});

// Send diplomacy action
router.post('/actions', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetNationId, action } = diplomacyActionSchema.parse(req.body);
    
    // Get player's nation (leader only)
    const membership = await prisma.nationMember.findFirst({
      where: {
        playerId: req.user!.id,
        role: 'LEADER'
      },
      include: { nation: true }
    });
    
    if (!membership) {
      res.status(403).json({ error: 'Only nation leaders can manage diplomacy' });
      return;
    }
    
    const sourceNationId = membership.nation.id;
    
    // Check if target nation exists
    const targetNation = await prisma.nation.findUnique({
      where: { id: targetNationId }
    });
    
    if (!targetNation) {
      res.status(404).json({ error: 'Target nation not found' });
      return;
    }
    
    // Check if diplomacy already exists
    let diplomacy = await prisma.diplomacy.findFirst({
      where: {
        OR: [
          { nationAId: sourceNationId, nationBId: targetNationId },
          { nationAId: targetNationId, nationBId: sourceNationId }
        ]
      }
    });
    
    if (diplomacy) {
      // Update existing diplomacy
      diplomacy = await prisma.diplomacy.update({
        where: { id: diplomacy.id },
        data: {
          status: 'PENDING',
          action: action,
          initiatedBy: sourceNationId
        }
      });
    } else {
      // Create new diplomacy record
      diplomacy = await prisma.diplomacy.create({
        data: {
          nationAId: sourceNationId,
          nationBId: targetNationId,
          status: 'PENDING',
          action: action,
          initiatedBy: sourceNationId
        }
      });
    }
    
    res.status(201).json({ 
      message: 'Diplomacy action sent',
      diplomacy
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Diplomacy action error:', error);
      res.status(500).json({ error: 'Failed to send diplomacy action' });
    }
  }
});

// Respond to diplomacy action
router.post('/respond', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { diplomacyId, response } = req.body;
    
    // Verify player is leader of target nation
    const membership = await prisma.nationMember.findFirst({
      where: {
        playerId: req.user!.id,
        role: 'LEADER'
      },
      include: { nation: true }
    });
    
    if (!membership) {
      res.status(403).json({ error: 'Only nation leaders can respond to diplomacy' });
      return;
    }
    
    // Update diplomacy status
    const diplomacy = await prisma.diplomacy.update({
      where: { id: diplomacyId },
      data: {
        status: response === 'ACCEPT' ? 'ACTIVE' : 'REJECTED'
      }
    });
    
    res.json({ diplomacy });
  } catch (error) {
    console.error('Diplomacy response error:', error);
    res.status(500).json({ error: 'Failed to respond to diplomacy' });
  }
});

// Get diplomacy for a nation
router.get('/nation/:nationId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const diplomacy = await prisma.diplomacy.findMany({
      where: {
        OR: [
          { nationAId: req.params.nationId },
          { nationBId: req.params.nationId }
        ]
      },
      include: {
        nationA: true,
        nationB: true
      }
    });
    
    res.json({ diplomacy });
  } catch (error) {
    console.error('Get diplomacy error:', error);
    res.status(500).json({ error: 'Failed to get diplomacy' });
  }
});

export const setupDiplomacyRoutes = (app: express.Application): void => {
  app.use('/api/diplomacy', router);
};