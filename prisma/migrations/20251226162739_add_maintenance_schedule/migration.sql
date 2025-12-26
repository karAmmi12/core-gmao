-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "intervalValue" INTEGER NOT NULL DEFAULT 1,
    "lastExecutedAt" DATETIME,
    "nextDueDate" DATETIME NOT NULL,
    "estimatedDuration" REAL,
    "assignedToId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" TEXT NOT NULL DEFAULT 'LOW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "maintenance_schedules_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "maintenance_schedules_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "technicians" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "maintenance_schedules_assetId_idx" ON "maintenance_schedules"("assetId");

-- CreateIndex
CREATE INDEX "maintenance_schedules_nextDueDate_idx" ON "maintenance_schedules"("nextDueDate");

-- CreateIndex
CREATE INDEX "maintenance_schedules_isActive_idx" ON "maintenance_schedules"("isActive");
