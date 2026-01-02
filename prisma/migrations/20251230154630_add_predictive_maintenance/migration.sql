-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_maintenance_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "maintenanceType" TEXT NOT NULL DEFAULT 'PREVENTIVE',
    "triggerType" TEXT NOT NULL DEFAULT 'TIME_BASED',
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "intervalValue" INTEGER NOT NULL DEFAULT 1,
    "lastExecutedAt" DATETIME,
    "nextDueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thresholdMetric" TEXT,
    "thresholdValue" REAL,
    "thresholdUnit" TEXT,
    "currentValue" REAL DEFAULT 0,
    "estimatedDuration" REAL,
    "assignedToId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" TEXT NOT NULL DEFAULT 'LOW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "maintenance_schedules_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "maintenance_schedules_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "technicians" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_maintenance_schedules" ("assetId", "assignedToId", "createdAt", "description", "estimatedDuration", "frequency", "id", "intervalValue", "isActive", "lastExecutedAt", "nextDueDate", "priority", "title", "updatedAt") SELECT "assetId", "assignedToId", "createdAt", "description", "estimatedDuration", "frequency", "id", "intervalValue", "isActive", "lastExecutedAt", "nextDueDate", "priority", "title", "updatedAt" FROM "maintenance_schedules";
DROP TABLE "maintenance_schedules";
ALTER TABLE "new_maintenance_schedules" RENAME TO "maintenance_schedules";
CREATE INDEX "maintenance_schedules_assetId_idx" ON "maintenance_schedules"("assetId");
CREATE INDEX "maintenance_schedules_nextDueDate_idx" ON "maintenance_schedules"("nextDueDate");
CREATE INDEX "maintenance_schedules_isActive_idx" ON "maintenance_schedules"("isActive");
CREATE INDEX "maintenance_schedules_triggerType_idx" ON "maintenance_schedules"("triggerType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
