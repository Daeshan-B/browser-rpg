# How to Start and Test BrowserRPG

## Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- Neon PostgreSQL database (free tier at https://neon.tech)
- Terminal/command prompt

---

## Step 1: Database Setup

### 1. Create Neon Account
1. Go to https://neon.tech
2. Sign up for free account
3. Create new project (name it "browser-rpg" or similar)

### 2. Get Connection String
1. In Neon dashboard, find your connection string
2. It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`

### 3. Configure Environment
Create `server/.env` file:
```env
DATABASE_URL="your-neon-connection-string-here"
JWT_SECRET="my-super-secret-key-change-this"
```

---

## Step 2: Install Dependencies

### Terminal 1 - Install Everything
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## Step 3: Setup Database

### Terminal 1 - Still in server folder
```bash
# Run database migrations
npx prisma migrate deploy

# Seed the database (creates 250K tiles + test user)
npm run seed
```

**Test credentials after seeding:**
- Email: `test@example.com`
- Password: `password123`

---

## Step 4: Start the Application

### Option A: Using Batch Scripts (Windows)

**Terminal 1 - Start Server:**
```bash

## Testing the Full Flow

### 1. Boot Scene (Automatic)
- Should see "LOADING BROWSER RPG..."
- Loading bar fills to 100%
- Shows "READY!" then moves to next scene

### 2. Auth Scene (Login/Register)
**Test Login:**
- Email: `test@example.com`
- Password: `password123`
- Click [ LOGIN ]

**Test Register:**
- Click [ REGISTER ] button
- Enter username (e.g., "TestPlayer")
- Enter email (e.g., "new@example.com")
- Enter password (e.g., "test123")
- Click [ REGISTER ]

### 3. Nation Scene (After Login)
- Enter nation name (e.g., "Empire")
- Click color picker to choose nation color
- Click anywhere on world preview map to select spawn location
- Click [ CREATE NATION ]

### 4. Game Scene (World Map)
**Navigation:**
- WASD or Arrow keys: Pan camera
- + key: Zoom in
- - key: Zoom out

**What to See:**
- Tile-based world map with sprite rendering
- Different terrain types (colors for now)
- Position coordinates in top-right
- Tile count display
- Zoom level indicator

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Check your DATABASE_URL in `server/.env`

### Issue: "Port 3000/4000 already in use"
**Solution:** Close other apps using those ports or change ports in config

### Issue: "Module not found"
**Solution:** Run `npm install` in both server and client folders

### Issue: "TypeScript errors"
**Solution:** Run `npx tsc --noEmit` in client folder to check

### Issue: Tiles show as black/missing
**Solution:** 
1. Check tileset file exists at `client/assets/urizen_onebit_tileset__v2d0.png`
2. Check browser console for loading errors
3. Verify Vite is serving assets correctly

### Issue: Login fails
**Solution:** 
1. Make sure you ran `npm run seed` in server
2. Check server console for error messages
3. Verify test credentials: test@example.com / password123

---

## Testing Checklist

- [ ] Server starts on port 4000
- [ ] Client starts on port 3000
- [ ] Boot scene loads assets successfully
- [ ] Auth scene shows login form
- [ ] Can login with test credentials
- [ ] Nation scene appears after login
- [ ] Can create nation with name and color
- [ ] Can select spawn location on map
- [ ] Game scene loads world map
- [ ] Can pan camera with WASD/Arrows
- [ ] Can zoom with +/- keys
- [ ] Tiles render with terrain colors
- [ ] Position coordinates update when moving
- [ ] Tile count shows in UI

---

## Quick Command Reference

```bash
# Install everything
npm install && cd server && npm install && cd ../client && npm install

# Setup database
cd server && npx prisma migrate deploy && npm run seed

# Start server (Terminal 1)
cd server && npm run dev

# Start client (Terminal 2)
cd client && npm run dev

# Check TypeScript
cd client && npx tsc --noEmit
```

---

## Expected Behavior

### Server Console
```
✅ Database connected
🌍 World generated: 250000 tiles
📍 Spawn zones created: 15
🚀 Server running on port 4000
```

### Client Console (F12)
```
✅ All assets loaded!
🌍 World info loaded
🎮 GameScene ready with tile sprites!
✅ Chunk (7,7) loaded
```

---

*Happy testing! 🎮*

cd server
npm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```

### Option B: Using Root Script

**Terminal 1:**
```bash
npm run dev:server
```

**Terminal 2:**
```bash
npm run dev:client
```

---

## Step 5: Access the Game

### Frontend (Game Client)
Open browser to: **http://localhost:3000**

### Backend (API Server)
Check at: **http://localhost:4000**

---
