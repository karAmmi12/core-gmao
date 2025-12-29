-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_work_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CORRECTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "estimatedDuration" INTEGER,
    "actualDuration" INTEGER,
    "assignedToId" TEXT,
    "laborCost" REAL NOT NULL DEFAULT 0,
    "materialCost" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "assetId" TEXT NOT NULL,
    CONSTRAINT "work_orders_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "technicians" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "work_orders_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_work_orders" ("actualDuration", "assetId", "assignedToId", "completedAt", "createdAt", "description", "estimatedDuration", "id", "laborCost", "materialCost", "priority", "scheduledAt", "startedAt", "status", "title", "totalCost") SELECT "actualDuration", "assetId", "assignedToId", "completedAt", "createdAt", "description", "estimatedDuration", "id", "laborCost", "materialCost", "priority", "scheduledAt", "startedAt", "status", "title", "totalCost" FROM "work_orders";
DROP TABLE "work_orders";
ALTER TABLE "new_work_orders" RENAME TO "work_orders";
CREATE INDEX "work_orders_assignedToId_idx" ON "work_orders"("assignedToId");
CREATE INDEX "work_orders_scheduledAt_idx" ON "work_orders"("scheduledAt");
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
