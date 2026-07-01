import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupAuthRoutes } from './routes/auth';
import { setupWorldRoutes } from './routes/world';
import { setupNationRoutes } from './routes/nation';
import { setupTradeRoutes } from './routes/trade';
import { setupDiplomacyRoutes } from './routes/diplomacy';
import { setupActionRoutes } from './routes/actions';
import { setupSocketHandlers } from './sockets';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// API Routes
setupAuthRoutes(app);
setupWorldRoutes(app);
setupNationRoutes(app);
setupTradeRoutes(app);
setupDiplomacyRoutes(app);
setupActionRoutes(app);

// Socket.io setup
setupSocketHandlers(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = parseInt(process.env.PORT || '4000', 10);

httpServer.listen(PORT, () => {
  console.log(`🚀 BrowserRPG Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🎮 Client should connect to ws://localhost:${PORT}`);
});

export { app, io, httpServer };