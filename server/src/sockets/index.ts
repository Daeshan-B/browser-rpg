import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';

interface AuthSocket extends Socket {
  userId?: string;
}

export function setupSocketHandlers(io: Server): void {
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token as string;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const decoded = jwt.verify(token, secret) as { userId: string; email: string };
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });
  
  io.on('connection', (socket: AuthSocket) => {
    console.log(`🔌 Player connected: ${socket.userId}`);
    
    if (socket.userId) {
      socket.join(`player:${socket.userId}`);
      prisma.player.update({
        where: { id: socket.userId },
        data: { isLoggedIn: true, lastLoginAt: new Date() }
      }).catch(err => console.error('Failed to update online status:', err));
    }
    
    socket.on('disconnect', () => {
      console.log(`🔌 Player disconnected: ${socket.userId}`);
      if (socket.userId) {
        prisma.player.update({
          where: { id: socket.userId },
          data: { isLoggedIn: false }
        }).catch(err => console.error('Failed to update offline status:', err));
      }
    });
  });
}
