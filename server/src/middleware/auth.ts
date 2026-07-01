import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    
    const decoded = jwt.verify(token, secret) as { userId: string; email: string };
    
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      
      const decoded = jwt.verify(token, secret) as { userId: string; email: string };
      
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
    }
    
    next();
  } catch (error) {
    // Token is optional, continue without authentication
    next();
  }
};