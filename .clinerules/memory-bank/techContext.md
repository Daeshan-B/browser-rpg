# Technical Context

## Technologies
- **Frontend**: Phaser 3, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma
- **Real-time**: Socket.io (configured, not yet used)
- **Auth**: JWT with bcrypt

## Project Structure
```
browser-rpg/
├── client/          # Phaser game
│   ├── assets/     # Tilesets, sprites
│   └── src/
│       ├── api/    # Axios client
│       └── scenes/ # Phaser scenes
├── server/          # Express API
│   ├── prisma/     # Schema & migrations
│   └── src/
│       ├── routes/ # API endpoints
│       └── middleware/
└── package.json    # Root config
```

## Key Configurations
- Client runs on port 3000
- Server runs on port 4000
- Vite proxies /api to localhost:4000
- TILE_SIZE = 32px (render size)
- CHUNK_SIZE = 32 tiles
- WORLD_SIZE = 500x500 tiles

## Environment Variables
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## Build Commands
- `npm run dev:client` - Start client dev server
- `npm run dev:server` - Start server dev server
- `cd server && npx prisma migrate deploy` - Deploy DB schema
- `cd server && npm run seed` - Generate world data