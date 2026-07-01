import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Register new player
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.player.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      res.status(400).json({ 
        error: 'Username or email already exists' 
      });
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create player
    const player = await prisma.player.create({
      data: {
        username,
        email,
        passwordHash
      }
    });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: player.id, email: player.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({
      player: {
        id: player.id,
        username: player.username,
        email: player.email
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find player
    const player = await prisma.player.findUnique({
      where: { email }
    });
    
    if (!player) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, player.passwordHash);
    
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: player.id, email: player.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      player: {
        id: player.id,
        username: player.username,
        email: player.email
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

// Get current user
router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const player = await prisma.player.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarColor: true,
        createdAt: true
      }
    });
    
    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    
    res.json({ player });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export const setupAuthRoutes = (app: express.Application): void => {
  app.use('/api/auth', router);
};