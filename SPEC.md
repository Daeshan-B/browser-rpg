# BrowserRPG — Game Specification Document

## 1. Game Overview

**BrowserRPG** is a retro 16-bit pixel art browser-based 2D RPG where players from around the world create and lead nations, conquer tiles, build infrastructure, establish trade routes, and engage in diplomacy on a persistent 500x500 tile world.

### Genre
- Persistent browser-based MMO
- Tile-based nation-building strategy
- Asynchronous multiplayer

### Target Audience
- Players who enjoy daily-login strategy games
- Fans of retro pixel art aesthetics
- Players who prefer async gameplay over real-time

### Core Pillars
1. **Conquest** — Expand your nation tile by tile
2. **Economy** — Build, trade, and manage resources
3. **Diplomacy** — Form alliances, truces, and rivalries
4. **Daily Engagement** — Login bonuses, upkeep, and progression

---

## 2. Technical Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Phaser 3 | ^3.80.1 | 2D game engine and rendering |
| TypeScript | ^5.4.5 | Type-safe JavaScript |
| Vite | ^5.2.11 | Build tool and dev server |
| Socket.io Client | ^4.7.5 | Real-time WebSocket communication |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express | ^4.19.2 | HTTP API server |
| Socket.io | ^4.7.5 | WebSocket server for real-time updates |
| PostgreSQL | 14+ | Primary database |
| Prisma | ^5.13.0 | ORM and database migrations |
| Redis | ^4.6.13 | Caching and tick scheduling |
| JSON Web Tokens | ^9.0.2 | Authentication |

---

## 3. World Specification

### Map Dimensions
- **Grid size**: 500 x 500 tiles (250,000 total tiles)
- **Tile size**: 32x32 pixels (rendered)
- **Visible area**: ~50x50 tiles per viewport (zoomable from 0.5x to 2x)
- **Coordinate system**: (x, y) where 0 ≤ x < 500, 0 ≤ y < 500

### Terrain Distribution
| Terrain | % of Map | Resources | Movement | Buildable |
|---------|---------|-----------|----------|-----------|
| Plain | 40% | Moderate (food, gold) | Normal | Yes |
| Forest | 20% | Wood, herbs | Slowed | Yes (cost +25%) |
| Mountain | 15% | Stone, ore, gems | Blocked to armies | Mines only |
| Desert | 10% | Low (gold only) | Fast | Yes (cost +50%) |
| Water | 10% | None | Impassable | No |
| Coast | 5% | Fish (bonus food) | Normal | Yes |

### Terrain Generation Algorithm
- Simple weighted random distribution per tile
- No noise-based generation (first iteration)
- Future: Simplex noise for natural-looking continents

### Spawn Zones
- 10-20 evenly distributed spawn zones (10x10 tiles each)
- New players start in the least-populated spawn zone
- 24-hour new player protection (cannot be attacked)
- Each spawn zone has 5 starter water wells

---

## 4. Database Schema

### Entity Relationship Overview
```
Player 1---* NationMember *---1 Nation
Player 1---* Action
Player 1---* LoginHistory
Nation 1---* Tile
Nation 1---* TradeRoute
Nation 1---* Diplomacy (as nationA or nationB)
```

### Tables

#### players
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Unique player identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login credential |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| avatar_color | VARCHAR(7) | Nullable | Hex color for avatar (#RRGGBB) |
| created_at | TIMESTAMP | default NOW() | Registration date |
| last_login | TIMESTAMP | Nullable | Last login timestamp |
| total_login_days | INT | default 0 | Lifetime login count |
| streak_days | INT | default 0 | Consecutive daily logins |

#### nations
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, default gen_random_uuid() | Unique nation identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Nation name |
| description | VARCHAR(500) | Nullable | Nation description/bio |
| color | VARCHAR(7) | NOT NULL | Nation color hex code |
| emblem | VARCHAR(255) | Nullable | Emblem sprite path |
| created_at | TIMESTAMP | default NOW() | Founding date |
| total_tiles | INT | default 0 | Current tile count |
| gold | INT | default 100 | Nation treasury |
| reputation | INT | default 0 | Diplomatic reputation score |

#### nation_members
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| player_id | UUID | FK -> players.id, PK | Member player |
| nation_id | UUID | FK -> nations.id, PK | Member nation |
| role | VARCHAR(20) | default 'member' | leader, officer, member |
| joined_at | TIMESTAMP | default NOW() | Join date |

#### tiles
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| x | INT | PK | X coordinate (0-499) |
| y | INT | PK | Y coordinate (0-499) |
| terrain_type | VARCHAR(20) | NOT NULL | plain, forest, mountain, desert, water, coast |
| nation_id | UUID | FK -> nations.id, Nullable | Owning nation |
| building_type | VARCHAR(50) | Nullable | farm, mine, market, castle, wall, road |
| building_level | INT | default 0 | Building upgrade level |
| resources | TEXT | default '{}' | JSON resource values |
| last_harvested | TIMESTAMP | Nullable | Last resource collection |

#### trade_routes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique route identifier |
| nation_id | UUID | FK -> nations.id | Owning nation |
| start_x | INT | NOT NULL | Origin tile X |
| start_y | INT | NOT NULL | Origin tile Y |
| end_x | INT | NOT NULL | Destination tile X |
| end_y | INT | NOT NULL | Destination tile Y |
| daily_gold | INT | default 10 | Gold generated per day |
| active | BOOLEAN | default true | Route status |
| created_at | TIMESTAMP | default NOW() | Creation date |
| UNIQUE | (nation_id, start_x, start_y, end_x, end_y) | | Prevent duplicates |

#### diplomacy
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| nation_a | UUID | FK -> nations.id, PK | Proposing nation |
| nation_b | UUID | FK -> nations.id, PK | Target nation |
| relation_type | VARCHAR(20) | NOT NULL | truce, alliance, war, neutral |
| expires_at | TIMESTAMP | Nullable | Expiration for temporary relations |
| created_at | TIMESTAMP | default NOW() | Establishment date |

#### actions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique action identifier |
| player_id | UUID | FK -> players.id | Initiating player |
| action_type | VARCHAR(50) | NOT NULL | attack, build, trade, harvest |
| target_x | INT | Nullable | Target tile X |
| target_y | INT | Nullable | Target tile Y |
| resolves_at | TIMESTAMP | NOT NULL | When action completes |
| status | VARCHAR(20) | default 'pending' | pending, completed, cancelled |
| result | TEXT | Nullable | JSON result data |
| created_at | TIMESTAMP | default NOW() | Submission date |

#### login_history
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| player_id | UUID | FK -> players.id, PK | Player identifier |
| login_date | DATE | PK | Login date |

---

## 5. API Endpoints

### Authentication
### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Create new account |
| POST | /api/auth/login | No | Authenticate and get JWT |
| GET | /api/auth/me | Yes | Get current player info |

**POST /api/auth/register**
Request:
```json
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (6+ chars)",
  "avatarColor": "string (#RRGGBB, optional)"
}
```
Response: `{ token, player: { id, username, avatarColor } }`

**POST /api/auth/login**
Request:
```json
{
  "email": "string",
  "password": "string"
}
```
Response: `{ token, player: { id, username, avatarColor } }`

### World

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/world/tiles | No | Get tile chunk (query: x, y, width, height) |
| POST | /api/world/claim | Yes | Claim an unowned tile |
| POST | /api/world/build | Yes | Build on an owned tile |

**GET /api/world/tiles**
Query: `?x=0&y=0&width=50&height=50`
Response: `{ tiles: [{ x, y, terrainType, nation, buildingType, buildingLevel }] }`

**POST /api/world/claim**
Request:
```json
{ "x": 0, "y": 0 }
```
Response: `{ message, tile: { x, y } }`

**POST /api/world/build**
Request:
```json
{ "x": 0, "y": 0, "buildingType": "farm" }
```
Valid types: farm, mine, market, castle, wall, road
Response: `{ message, tile: { x, y, buildingType, level } }`

### Nation

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/nation/create | Yes | Create a new nation |
| POST | /api/nation/join | Yes | Join an existing nation |
| GET | /api/nation/me | Yes | Get player's current nation |
| GET | /api/nation/:id | No | Get nation details |

**POST /api/nation/create**
Request:
```json
{
  "name": "string (3-100 chars)",
  "color": "#RRGGBB",
  "description": "string (optional, max 500)"
}
```
Response: `{ nation }`

**POST /api/nation/join**
Request:
```json
{ "nationId": "uuid" }
```
Response: `{ nation }`

### Future Endpoints (Phase 3+)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/world/attack | Declare attack on enemy tile |
| POST | /api/world/harvest | Collect resources from tile |
| GET | /api/nation/list | List all nations |
| POST | /api/nation/leave | Leave current nation |
| POST | /api/nation/kick | Kick member (leader only) |
| GET | /api/trade/routes | List nation's trade routes |
| POST | /api/trade/create | Create trade route |
| POST | /api/trade/remove | Remove trade route |
| GET | /api/diplomacy/list | List nation's relations |
| POST | /api/diplomacy/propose | Propose treaty |
| POST | /api/diplomacy/respond | Accept/reject treaty |
| GET | /api/actions/pending | Get player's pending actions |
| POST | /api/login/daily | Record daily login + claim bonus |

---

## 6. Game Mechanics

### 6.1 Tile Control

#### Claiming
- **Cost**: 10 gold + 1 food
- **Requirement**: Tile must be unowned and adjacent to a nation-owned tile
- **Restriction**: Cannot claim water tiles
- **Result**: Tile becomes nation color, +1 to nation tile count

#### Adjacency Rules
- 8-directional adjacency (including diagonals)
- A nation can only claim tiles adjacent to existing owned tiles
- Exception: Spawn zones grant initial adjacency

### 6.2 Building System

#### Building Costs and Effects
| Building | Gold Cost | Effect | Upgrade (per level) |
|----------|-----------|--------|---------------------|
| Farm | 50 | +2 food/day | +1 food/day |
| Mine | 100 | +3 gold/day | +2 gold/day |
| Market | 75 | +5% trade route income | +3% per level |
| Castle | 500 | +50% defense + recruitment | +25% defense |
| Wall | 25 | +20% tile defense | +15% defense |
| Road | 10 | Connects tiles, +20% move speed | +10% speed |

#### Building Rules
- One building per tile
- Buildings can be upgraded (max level 10)
- Building on forest costs +25%, desert +50%
- Castles can only be built on plains
- Roads are free to build but must connect two owned tiles

### 6.3 Economy

#### Resources
| Resource | Source | Used For |
|----------|--------|----------|
| Gold | Mines, trade routes, login bonus | Building, claiming, upkeep |
| Food | Farms, coast tiles | Upkeep, army movement |
| Wood | Forest tiles | Building |
| Stone | Mountain tiles | Castles, walls |

#### Resource Generation
- Generated daily at game tick (midnight UTC)
- Collected from owned tiles with relevant buildings
- Coast tiles provide +1 food/day without building
- Forest tiles provide +1 wood/day without building
- Mountain tiles provide +1 stone/day without building

#### Upkeep Costs
- Per building: 1 gold/day
- Per tile (over 10): 1 gold/day per tile
- Per tile (over 50): 2 gold/day per tile
- Nation with 0 gold enters "debt" — tiles randomly defect

### 6.4 Trade Routes

#### Requirements
- Must own both start and end tiles
- Start and end must be within 50 tiles of each other
- Max 10 routes per nation
- Tiles in path (Manhattan distance) cannot be enemy-owned

#### Income Calculation
```
Base daily gold = 5 + (building_level of market at start + end)
Route bonus = base × (1 + 0.05 × market_levels)
```

#### Disruption
- Route is disrupted if an enemy tile enters the path
- Can be restored by reclaiming the disrupting tile
- Disrupted routes generate 0 gold

### 6.5 Combat (Async)

#### Declaring Attack
1. Select enemy-owned tile
2. Confirm attack — action enters queue
3. Resolution time: 5-30 minutes (based on tile value)
4. Both parties are notified on resolution

#### Attack Formula
```
Attack Power = attacking_nation_tiles × 1.0
Defense Power = defending_nation_tiles × 1.0 × defense_bonus
Tile Defense Bonus = 1.0 + (wall_level × 0.20) + (castle ? 0.50 : 0)

Win Condition: Attack Power > Defense Power
```

#### Results
- **Attacker wins**: Tile transfers to attacker's nation
- **Defender wins**: Attacker loses 10 gold (if available)
- Tie: Defender retains tile, both lose 10 gold

#### Cooldown
- After resolving an attack on a tile, that tile gets +25% defense for 24 hours
- After losing a tile, the attacking nation cannot attack for 1 hour

### 6.6 Diplomacy

#### Relation Types
| Type | Duration | Effects |
|------|----------|---------|
| Neutral | Permanent (default) | No modifiers |
| Truce | 7 days | No attacks between nations |
| Alliance | 14 days (renewable) | No attacks, shared vision, +5% trade income |
| War | Until truce | -5 reputation/day, no trade, attack cooldown halved |

#### Proposing
- Any nation can propose to any other nation
- Must not already have an active relation
- Target nation must accept
- Rejection costs 2 reputation

#### Reputation
- Range: -100 to 100
- High reputation: better trade rates, alliance requests
- Low reputation: easier to declare war on, trade penalties
- Reputation change: +1 per day of active alliance, -2 per day of war

### 6.7 Daily Engagement

#### Login Streak Bonus
| Streak Days | Gold Bonus |
|-------------|-----------|
| 1 | 5 |
| 2 | 10 |
| 3 | 15 |
| 4 | 25 |
| 5 | 40 |
| 6 | 60 |
| 7 (max) | 100 |

- Streak resets if player misses a day
- Recorded via /api/login/daily endpoint

#### Daily Challenges (Phase 5)
| Challenge | Reward |
|-----------|--------|
| Claim 3 tiles | 20 gold |
| Collect resources from 5 tiles | 15 gold |
| Attack an enemy tile | 25 gold |
| Build 2 buildings | 30 gold |
| Login 3 days in a row | 50 gold |

---

## 7. Frontend Architecture

### 7.1 Phaser Scenes

| Scene | Purpose |
|-------|---------|
| BootScene | Load assets, connect WebSocket, check auth |
| LoginScene | Registration and login UI |
| WorldScene | Main game view (tilemap, player avatar, controls) |
| NationScene | Nation management (members, stats, settings) |
| DiplomacyScene | View and manage nation relations |
| TradeScene | Trade route management UI |
| BuildScene | Building placement interface |
| ActionScene | View pending and completed actions |

### 7.2 WorldScene Components

- **Tilemap Chunk System**: Load 50x50 tile chunks around player viewport
- **Camera**: Follow player, support zoom (0.5x to 2x)
- **Tile Sprites**: 32x32 pixel art per terrain type
- **Nation Coloring**: Overlay nation color on owned tiles
- **Building Sprites**: Render buildings on tiles
- **HUD**: Gold, food, nation name, action notifications
- **Mini-map**: Small overview in top-right corner

### 7.3 Rendering Pipeline

```
Game Loop
  ├── Camera update (position, zoom)
  ├── Determine visible tiles
  │     └── Request unseen chunk from server
  ├── Render terrain tiles
  ├── Render nation overlays
  ├── Render buildings
  ├── Render UI (HUD, mini-map)
  └── WebSocket sync
        ├── Receive real-time tile changes
        └── Send player actions
```

---

## 8. Data Flow

### 8.1 Claiming a Tile (Example Flow)

```
Player clicks unowned tile
  ├── Client: Validate adjacency
  ├── Client: Send POST /api/world/claim
  ├── Server: Verify player belongs to nation
  ├── Server: Verify tile is unowned
  ├── Server: Verify tile is not water
  ├── Server: Update tile.nationId
  ├── Server: Increment nation.totalTiles
  ├── Server: Emit 'tile-changed' via WebSocket
  ├── Server: Return success response
  └── Client: Update tile color + show notification
     └── All players in chunk room: receive real-time update
```

### 8.2 Game Tick System

```
Server tick runs every 60 seconds
  ├── Process pending actions (check resolves_at)
  │     ├── Attack actions: resolve combat
  │     ├── Build actions: mark complete
  │     └── Harvest actions: collect resources
  ├── Generate daily resources (if past midnight)
  ├── Apply upkeep costs
  ├── Check diplomacy expirations
  └── Broadcast world state changes
```

---

## 9. Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project scaffolding (folders, package.json, configs)
- [ ] PostgreSQL database setup + Prisma schema
- [ ] Auth system (register, login, JWT)
- [ ] World seed script (500x500 terrain generation)
- [ ] Basic Phaser + Vite setup
- [ ] Tilemap renderer with mock data

### Phase 2: Core Gameplay (Week 3-4)
- [ ] Tile chunk loading from API
- [ ] Tile claiming UI + backend
- [ ] Nation creation/join system
- [ ] Building placement system
- [ ] WebSocket real-time updates
- [ ] Camera pan/zoom controls

### Phase 3: Combat (Week 5-6)
- [ ] Async action queue system
- [ ] Combat resolution logic
- [ ] Attack UI (select target, confirm)
- [ ] Action status tracking
- [ ] Notifications for action results

### Phase 4: Economy & Trade (Week 7-8)
- [ ] Resource generation system
- [ ] Trade route creation UI
- [ ] Upkeep calculation
- [ ] Economic dashboard
- [ ] Daily resource collection

### Phase 5: Diplomacy (Week 9-10)
- [ ] Diplomacy proposal system
- [ ] Alliance/truce/war mechanics
- [ ] Reputation system
- [ ] Nation profile pages
- [ ] Diplomatic notifications

### Phase 6: Daily Engagement (Week 11-12)
- [ ] Login streak tracking
- [ ] Daily challenge system
- [ ] Reward distribution
- [ ] Achievement system
- [ ] Leaderboards

### Phase 7: Polish (Week 13+)
- [ ] Pixel art asset creation
- [ ] Animations (buildings, combat effects)
- [ ] Sound effects and music
- [ ] UI polish and transitions
- [ ] Performance optimization (chunking, caching)
- [ ] Mobile responsiveness

---

## 10. File Structure

```
BrowserRPG/
├── client/                         # Phaser frontend
│   ├── src/
│   │   ├── scenes/
│   │   │   ├── BootScene.ts        # Asset loading and auth check
│   │   │   ├── LoginScene.ts       # Registration/login UI
│   │   │   ├── WorldScene.ts       # Main tilemap game view
│   │   │   ├── NationScene.ts      # Nation management
│   │   │   ├── DiplomacyScene.ts   # Diplomatic relations
│   │   │   ├── TradeScene.ts       # Trade route management
│   │   │   ├── BuildScene.ts       # Building placement
│   │   │   └── ActionScene.ts      # Action queue viewer
│   │   ├── components/             # Reusable Phaser components
│   │   │   ├── Tilemap.ts          # Tile chunk loading and rendering
│   │   │   ├── HUD.ts              # Heads-up display
│   │   │   ├── MiniMap.ts          # World overview map
│   │   │   └── Button.ts           # Clickable button component
│   │   ├── api/
│   │   │   ├── client.ts           # Axios/fetch HTTP client
│   │   │   └── socket.ts           # Socket.io WebSocket client
│   │   ├── assets/
│   │   │   ├── tiles/              # Tile sprites
│   │   │   ├── buildings/          # Building sprites
│   │   │   ├── ui/                 # UI elements
│   │   │   └── audio/              # Sound effects
│   │   ├── utils/
│   │   │   ├── constants.ts        # Game constants
│   │   │   └── helpers.ts          # Utility functions
│   │   └── main.ts                 # Game entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                         # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts             # Authentication endpoints
│   │   │   ├── world.ts            # Tile/world endpoints
│   │   │   ├── nation.ts           # Nation endpoints
│   │   │   ├── trade.ts            # Trade route endpoints
│   │   │   ├── diplomacy.ts        # Diplomacy endpoints
│   │   │   └── actions.ts          # Action queue endpoints
│   │   ├── sockets/
│   │   │   └── index.ts            # WebSocket handler setup
│   │   ├── prisma/
│   │   │   ├── client.ts           # Prisma client singleton
│   │   │   └── seed.ts             # World generation script
│   │   ├── services/
│   │   │   ├── combat.ts           # Combat resolution logic
│   │   │   ├── economy.ts          # Resource generation
│   │   │   ├── diplomacy.ts        # Diplomacy logic
│   │   │   └── tick.ts             # Game tick scheduler
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT auth middleware
│   │   └── server.ts               # Express + Socket.io entry
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                        # Environment variables
│
├── .gitignore
├── package.json                    # Workspace root
├── SPEC.md                         # This specification document
└── README.md                       # Project overview
```

---

## 11. Performance Considerations

### Frontend
- **Chunk-based loading**: Load only visible tiles + 1 chunk buffer
- **Sprite batching**: Use Phaser's built-in texture atlas and batch rendering
- **LOD system**: Reduce tile detail at higher zoom levels (below 0.75x)
- **Asset preloading**: Load all sprites at BootScene
- **Throttle API calls**: Debounce tile requests to prevent oversampling

### Backend
- **Connection pooling**: Prisma connection pool (recommended: 10-20 connections)
- **Query optimization**: Indexed tile queries by (x, y) and nation_id
- **Redis cache**: Hot tile data (recently accessed chunks) cached for 5 minutes
- **Batch processing**: Game tick processes actions in batches of 100
- **Rate limiting**: 100 requests/minute per player for world endpoints

---

## 12. Security

- **Authentication**: JWT tokens with 7-day expiration, stored in localStorage
- **Password hashing**: bcrypt with 10 salt rounds
- **Input validation**: Zod schemas on all API endpoints
- **SQL injection prevention**: Prisma parameterized queries
- **Rate limiting**: Express middleware for API abuse prevention
- **CORS**: Whitelist allowed origins
- **WebSocket auth**: JWT verification on socket connection
- **No client authority**: All game actions validated server-side

---

*This specification is a living document and will be updated as development progresses.*
