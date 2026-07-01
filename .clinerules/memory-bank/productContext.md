# Product Context

## Why This Exists
BrowserRPG fills a gap for browser-based nation building games with:
- No installation required
- Persistent world with real database
- Real-time multiplayer competition
- Retro aesthetic that appeals to strategy game fans

## Problems Solved
1. **Accessibility**: Play anywhere, no downloads
2. **Persistence**: World state saved in PostgreSQL
3. **Scalability**: Serverless database handles growth
4. **Performance**: Chunk loading enables massive world

## User Experience Goals
- **Instant Play**: Load in under 3 seconds
- **Smooth Exploration**: 60 FPS camera movement
- **Clear Feedback**: Visual terrain types, ownership indicators
- **Simple Controls**: WASD to move, +/- to zoom
- **Progressive Complexity**: Start simple, unlock features

## How It Should Work
1. Player lands on login screen
2. Registers or logs in with email
3. Creates or joins a nation
4. Spawns in safe zone
5. Explores world, conquers tiles
6. Builds structures for bonuses
7. Competes with other players

## Success Metrics
- Page load time < 3s
- Chunk load time < 500ms
- 60 FPS during exploration
- < 1s action response time