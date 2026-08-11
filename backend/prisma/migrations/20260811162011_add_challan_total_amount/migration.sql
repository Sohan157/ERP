-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Challan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challanNumber" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL NOT NULL DEFAULT 0,
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Challan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Challan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Challan" ("challanNumber", "createdAt", "createdById", "customerId", "id", "status", "totalQuantity", "updatedAt") SELECT "challanNumber", "createdAt", "createdById", "customerId", "id", "status", "totalQuantity", "updatedAt" FROM "Challan";
DROP TABLE "Challan";
ALTER TABLE "new_Challan" RENAME TO "Challan";
CREATE UNIQUE INDEX "Challan_challanNumber_key" ON "Challan"("challanNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
