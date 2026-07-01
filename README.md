# BrowserRPG

A retro 16-bit pixel art browser-based 2D RPG with nation-building and conquest.

## Overview

BrowserRPG is a persistent browser-based MMO where players create and lead nations, conquer tiles, build infrastructure, establish trade routes, and engage in diplomacy on a persistent 500x500 tile world.

### Core Features

- **Conquest** — Expand your nation tile by tile
- **Economy** — Build, trade, and manage resources
- **Diplomacy** — Form alliances, truces, and rivalries
- **Daily Engagement** — Login bonuses, upkeep, and progression

## Tech Stack

### Frontend
- **Phaser 3** - 2D game engine and rendering
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Socket.io Client** - Real-time WebSocket communication

### Backend
- **Node.js** - Runtime environment
- **Express** - HTTP API server
- **Socket.io** - WebSocket server
- **PostgreSQL** - Primary database
- **Prisma** - ORM and database migrations
- **Redis** - Caching and tick scheduling (optional)
- **JWT** - Authentication

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # The .env file is already created in server/
   # Edit server/.env with your database credentials
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   cd server
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

4. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Development Scripts

- `npm run dev` - Start both client and server
- `npm run dev:client` - Start client (port 3000)
- `npm run dev:server` - Start server (port 4000)
- `npm run build` - Build both workspaces

## See Also

- [SPEC.md](SPEC.md) - Detailed game specification and design document
