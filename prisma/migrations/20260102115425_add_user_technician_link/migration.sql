/*
  Warnings:

  - You are about to drop the column `quantity` on the `work_order_parts` table. All the data in the column will be lost.
  - Added the required column `quantityPlanned` to the `work_order_parts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `work_order_parts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "part_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'NORMAL',
    "workOrderId" TEXT,
    "assetId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "rejectionReason" TEXT,
    "deliveredAt" DATETIME,
    "deliveredById" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "part_requests_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "part_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "part_requests_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "part_requests_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "part_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "part_requests_deliveredById_fkey" FOREIGN KEY ("deliveredById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "technicianId" TEXT,
    "inviteToken" TEXT,
    "inviteExpiresAt" DATETIME,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("createdAt", "createdById", "email", "failedLogins", "id", "inviteExpiresAt", "inviteToken", "isActive", "lastLoginAt", "lockedUntil", "mustChangePassword", "name", "password", "role", "updatedAt") SELECT "createdAt", "createdById", "email", "failedLogins", "id", "inviteExpiresAt", "inviteToken", "isActive", "lastLoginAt", "lockedUntil", "mustChangePassword", "name", "password", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_technicianId_key" ON "users"("technicianId");
CREATE UNIQUE INDEX "users_inviteToken_key" ON "users"("inviteToken");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_isActive_idx" ON "users"("isActive");
CREATE INDEX "users_technicianId_idx" ON "users"("technicianId");
CREATE TABLE "new_work_order_parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workOrderId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantityPlanned" INTEGER NOT NULL,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "quantityConsumed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "requestedById" TEXT,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "consumedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "work_order_parts_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "work_order_parts_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "work_order_parts_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "work_order_parts_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_work_order_parts" ("createdAt", "id", "partId", "totalPrice", "unitPrice", "workOrderId") SELECT "createdAt", "id", "partId", "totalPrice", "unitPrice", "workOrderId" FROM "work_order_parts";
DROP TABLE "work_order_parts";
ALTER TABLE "new_work_order_parts" RENAME TO "work_order_parts";
CREATE INDEX "work_order_parts_workOrderId_idx" ON "work_order_parts"("workOrderId");
CREATE INDEX "work_order_parts_partId_idx" ON "work_order_parts"("partId");
CREATE INDEX "work_order_parts_status_idx" ON "work_order_parts"("status");
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
    "estimatedCost" REAL,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "rejectionReason" TEXT,
    "assetId" TEXT NOT NULL,
    CONSTRAINT "work_orders_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "technicians" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "work_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "work_orders_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_work_orders" ("actualDuration", "assetId", "assignedToId", "completedAt", "createdAt", "description", "estimatedDuration", "id", "laborCost", "materialCost", "priority", "scheduledAt", "startedAt", "status", "title", "totalCost", "type") SELECT "actualDuration", "assetId", "assignedToId", "completedAt", "createdAt", "description", "estimatedDuration", "id", "laborCost", "materialCost", "priority", "scheduledAt", "startedAt", "status", "title", "totalCost", "type" FROM "work_orders";
DROP TABLE "work_orders";
ALTER TABLE "new_work_orders" RENAME TO "work_orders";
CREATE INDEX "work_orders_assignedToId_idx" ON "work_orders"("assignedToId");
CREATE INDEX "work_orders_scheduledAt_idx" ON "work_orders"("scheduledAt");
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");
CREATE INDEX "work_orders_requiresApproval_idx" ON "work_orders"("requiresApproval");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "part_requests_partId_idx" ON "part_requests"("partId");

-- CreateIndex
CREATE INDEX "part_requests_requestedById_idx" ON "part_requests"("requestedById");

-- CreateIndex
CREATE INDEX "part_requests_status_idx" ON "part_requests"("status");

-- CreateIndex
CREATE INDEX "part_requests_urgency_idx" ON "part_requests"("urgency");
