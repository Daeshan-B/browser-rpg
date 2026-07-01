# System Patterns

## Architecture
- Client-server architecture with REST API
- Chunk-based world loading (32x32 tiles per chunk)
- Lazy loading of chunks as player explores
- JWT-based authentication

## Database Schema
- **Tile**: x, y, terrain, nationId (unique composite key)
- **Nation**: name, color, spawnX, spawnY, ownerId
- **Player**: username, email, password (hashed)
- **Building**: typeId, tileId, level, ownerId
- **Action**: type, targetX, targetY, playerId, status

## API Patterns
- All routes prefixed with /api
- Auth middleware for protected routes
- Optional auth for world data (public read)
- Chunk-based tile fetching for efficiency

## Game Patterns
- Scene-based game flow (Boot → Auth → Game)
- Camera follows player exploration
- Visible chunk culling for performance
- Terrain types mapped to colors (temporarily)

## Key Design Decisions
1. Serverless DB (Neon) for easy scaling
2. Chunk loading instead of full world fetch
3. Color-coded terrain as placeholder for sprites
4. Simple 2D top-down view