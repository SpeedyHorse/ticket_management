-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNumber" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qrCode" TEXT,
    "qrSignature" TEXT,
    "zkProofHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("eventId", "id", "price", "purchaseDate", "qrCode", "qrSignature", "status", "ticketNumber", "userId", "zkProofHash") SELECT "eventId", "id", "price", "purchaseDate", "qrCode", "qrSignature", "status", "ticketNumber", "userId", "zkProofHash" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");
CREATE INDEX "Ticket_eventId_idx" ON "Ticket"("eventId");
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");
CREATE INDEX "Ticket_ticketNumber_idx" ON "Ticket"("ticketNumber");
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
