# BrowserRPG 🎮

A retro nation-building browser game with real-time multiplayer, built with Phaser, Node.js, and PostgreSQL.

## 🌟 Features

- **500x500 Tile World** - Explore a massive procedurally-generated world
- **Real-time Multiplayer** - Compete with other players to conquer territory
- **Nation Building** - Create your nation, build structures, and expand your empire
- **6 Terrain Types** - Plains, Forest, Mountains, Desert, Water, and Coast
- **Chunk-based Loading** - Efficient world rendering with dynamic chunk loading
- **Serverless Database** - Powered by Neon PostgreSQL

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Phaser 3, TypeScript, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Real-time** | Socket.io |
| **Authentication** | JWT |

## 📁 Project Structure

```
BrowserRPG/
├── client/                 # Phaser game client
│   ├── assets/            # Game assets (tilesets, sprites)
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── scenes/       # Phaser scenes (Boot, Auth, Game, UI)
│   │   └── main.ts       # Entry point
│   └── vite.config.ts    # Vite configuration
├── server/                # Express backend
│   ├── prisma/           # Database schema & migrations
│   ├── scripts/          # Database seeding scripts
│   └── src/
│       ├── routes/       # API routes (auth, world, nation, actions)
│       ├── middleware/   # Auth middleware
│       └── prisma/       # Prisma client
├── assets/               # Shared assets
└── package.json         # Root package manager
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Neon PostgreSQL account (free tier works!)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/Daeshan-B/browser-rpg.git
cd browser-rpg
```

### 2. Set Up Database

1. Create a free account at [Neon.tech](https://neon.tech)
2. Create a new project and get your connection string
3. Update `server/.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
JWT_SECRET="your-secret-key-here"
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install and setup server
cd server
npm install
npx prisma migrate deploy
npm run seed

# Install client dependencies
cd ../client
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Or use the batch script:
```bash
# Windows
start-client.bat

# Then manually start server in another terminal
cd server && npm run dev
```

### 5. Access the Game

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

## 🎮 Game Controls

| Key | Action |
|-----|--------|
| **WASD / Arrows** | Pan camera |
| **+ / -** | Zoom in/out |
| **Mouse** | Pan (future) |

## 📊 Database Schema

The game uses 9 main tables:

- **Player** - User accounts and authentication
- **Nation** - Player nations with spawn zones
- **Tile** - 250,000 world tiles (500x500 grid)
- **Building** - Structures on tiles
- **Action** - Player action queue
- **BuildingType** - Building definitions
- **Resource** - Resource types
- **SpawnZone** - Safe starting areas
- **PlayerNation** - Player-nation relationships

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### World
- `GET /api/world/info` - Get world statistics
- `GET /api/world/chunk?x=0&y=0` - Get 32x32 tile chunk
- `GET /api/world/tile?x=0&y=0` - Get single tile
- `GET /api/world/spawn-zones` - Get available spawn zones

### Nations
- `POST /api/nation/` - Create new nation
- `GET /api/nation/my-nations` - Get your nations
- `GET /api/nation/:id` - Get nation details

### Actions
- `POST /api/actions/queue` - Queue an action
- `GET /api/actions/queue` - Get action queue
- `DELETE /api/actions/queue/:id` - Cancel action

## 🧪 Test Credentials

After running the seed script, you can test with:

```
Email: test@example.com
Password: password123
```

## 🎨 Assets

- **Tileset**: Urizen Onebit Tileset v2.0
- **Style**: 16x16 pixel art, 1-bit retro aesthetic

## 📈 Performance

- **Chunk-based loading**: Only loads visible 32x32 tile chunks
- **Database indexing**: Optimized queries for tile lookups
- **Lazy loading**: Chunks loaded as player explores

## 🚧 Roadmap

- [ ] Implement authentication in game client
- [ ] Add tile sprite mapping (currently color-coded)
- [ ] Build nation UI and management
- [ ] Implement action system (conquer, build)
- [ ] Add real-time socket updates
- [ ] Create building placement system
- [ ] Add resource generation
- [ ] Implement player movement

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - feel free to use this project for learning or as a base for your own game!

## 🙏 Acknowledgments

- **Urizen** - Onebit Tileset v2.0
- **Neon** - Serverless PostgreSQL hosting
- **Phaser** - Amazing game framework

---

Built with ❤️ using Phaser, Node.js, and PostgreSQL

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
