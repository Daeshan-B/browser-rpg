-- CreateEnum
CREATE TYPE "TerrainType" AS ENUM ('PLAIN', 'FOREST', 'MOUNTAIN', 'DESERT', 'WATER', 'COAST');

-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('WATER_WELL', 'FARM', 'LUMBER_MILL', 'STONE_QUARRY', 'MINE', 'MARKET', 'BARRACKS', 'WALL', 'TOWER', 'PALACE');

-- CreateEnum
CREATE TYPE "NationRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "DiplomacyStatus" AS ENUM ('NONE', 'ALLY', 'TRUCE', 'WAR');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('BUILD_BUILDING', 'UPGRADE_BUILDING', 'CONQUER_TILE', 'SEND_ARMY', 'CREATE_TRADE_ROUTE', 'UPDATE_TRADE_ROUTE', 'SEND_DIPLOMACY_REQUEST', 'RESPOND_DIPLOMACY_REQUEST');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarColor" TEXT DEFAULT '#4a90d9',
    "gold" INTEGER NOT NULL DEFAULT 1000,
    "wood" INTEGER NOT NULL DEFAULT 500,
    "stone" INTEGER NOT NULL DEFAULT 500,
    "food" INTEGER NOT NULL DEFAULT 1000,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nation_members" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "nationId" TEXT NOT NULL,
    "role" "NationRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nation_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiles" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "terrain" "TerrainType" NOT NULL DEFAULT 'PLAIN',
    "nationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "type" "BuildingType" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "tileId" TEXT NOT NULL,
    "nationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_routes" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "nationIdA" TEXT NOT NULL,
    "nationIdB" TEXT NOT NULL,
    "tileXA" INTEGER NOT NULL,
    "tileYA" INTEGER NOT NULL,
    "tileXB" INTEGER NOT NULL,
    "tileYB" INTEGER NOT NULL,
    "goodsType" TEXT NOT NULL,
    "goodsAmount" INTEGER NOT NULL,
    "goldPerTick" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diplomacy" (
    "id" TEXT NOT NULL,
    "nationIdA" TEXT NOT NULL,
    "nationIdB" TEXT NOT NULL,
    "status" "DiplomacyStatus" NOT NULL DEFAULT 'NONE',
    "truceExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diplomacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "targetX" INTEGER,
    "targetY" INTEGER,
    "parameters" JSONB,
    "executesAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spawn_zones" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spawn_zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_username_key" ON "players"("username");

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");

-- CreateIndex
CREATE UNIQUE INDEX "nations_name_key" ON "nations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "nations_founderId_key" ON "nations"("founderId");

-- CreateIndex
CREATE UNIQUE INDEX "nation_members_playerId_nationId_key" ON "nation_members"("playerId", "nationId");

-- CreateIndex
CREATE INDEX "tiles_x_y_idx" ON "tiles"("x", "y");

-- CreateIndex
CREATE INDEX "tiles_nationId_idx" ON "tiles"("nationId");

-- CreateIndex
CREATE UNIQUE INDEX "tiles_x_y_key" ON "tiles"("x", "y");

-- CreateIndex
CREATE INDEX "buildings_nationId_idx" ON "buildings"("nationId");

-- CreateIndex
CREATE INDEX "buildings_type_idx" ON "buildings"("type");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_tileId_type_key" ON "buildings"("tileId", "type");

-- CreateIndex
CREATE INDEX "trade_routes_playerId_idx" ON "trade_routes"("playerId");

-- CreateIndex
CREATE INDEX "trade_routes_nationIdA_idx" ON "trade_routes"("nationIdA");

-- CreateIndex
CREATE INDEX "trade_routes_nationIdB_idx" ON "trade_routes"("nationIdB");

-- CreateIndex
CREATE INDEX "diplomacy_nationIdA_idx" ON "diplomacy"("nationIdA");

-- CreateIndex
CREATE INDEX "diplomacy_nationIdB_idx" ON "diplomacy"("nationIdB");

-- CreateIndex
CREATE UNIQUE INDEX "diplomacy_nationIdA_nationIdB_key" ON "diplomacy"("nationIdA", "nationIdB");

-- CreateIndex
CREATE INDEX "actions_playerId_idx" ON "actions"("playerId");

-- CreateIndex
CREATE INDEX "actions_executesAt_idx" ON "actions"("executesAt");

-- CreateIndex
CREATE INDEX "actions_status_idx" ON "actions"("status");

-- CreateIndex
CREATE INDEX "login_history_playerId_idx" ON "login_history"("playerId");

-- CreateIndex
CREATE INDEX "login_history_loginAt_idx" ON "login_history"("loginAt");

-- CreateIndex
CREATE INDEX "spawn_zones_playerCount_idx" ON "spawn_zones"("playerCount");

-- CreateIndex
CREATE UNIQUE INDEX "spawn_zones_x_y_key" ON "spawn_zones"("x", "y");

-- AddForeignKey
ALTER TABLE "nations" ADD CONSTRAINT "nations_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nation_members" ADD CONSTRAINT "nation_members_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nation_members" ADD CONSTRAINT "nation_members_nationId_fkey" FOREIGN KEY ("nationId") REFERENCES "nations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiles" ADD CONSTRAINT "tiles_nationId_fkey" FOREIGN KEY ("nationId") REFERENCES "nations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_tileId_fkey" FOREIGN KEY ("tileId") REFERENCES "tiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_nationId_fkey" FOREIGN KEY ("nationId") REFERENCES "nations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_routes" ADD CONSTRAINT "trade_routes_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_routes" ADD CONSTRAINT "trade_routes_nationIdA_fkey" FOREIGN KEY ("nationIdA") REFERENCES "nations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_routes" ADD CONSTRAINT "trade_routes_nationIdB_fkey" FOREIGN KEY ("nationIdB") REFERENCES "nations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomacy" ADD CONSTRAINT "diplomacy_nationIdA_fkey" FOREIGN KEY ("nationIdA") REFERENCES "nations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomacy" ADD CONSTRAINT "diplomacy_nationIdB_fkey" FOREIGN KEY ("nationIdB") REFERENCES "nations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
