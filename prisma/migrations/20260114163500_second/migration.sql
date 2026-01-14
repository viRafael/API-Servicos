/*
  Warnings:

  - You are about to alter the column `paymentIntentId` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `paymentMethod` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `receiptUrl` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `refundId` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `reviews` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" INTEGER NOT NULL,
    "paymentMethod" INTEGER,
    "receiptUrl" INTEGER,
    "refundId" INTEGER,
    "refundAmount" REAL,
    "refundedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("amount", "bookingId", "createdAt", "id", "paymentIntentId", "paymentMethod", "receiptUrl", "refundAmount", "refundId", "refundedAt", "status", "updatedAt", "userId") SELECT "amount", "bookingId", "createdAt", "id", "paymentIntentId", "paymentMethod", "receiptUrl", "refundAmount", "refundId", "refundedAt", "status", "updatedAt", "userId" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE UNIQUE INDEX "payments_paymentIntentId_key" ON "payments"("paymentIntentId");
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");
CREATE TABLE "new_reviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("bookingId", "clientId", "comment", "createdAt", "id", "providerId", "rating", "updatedAt") SELECT "bookingId", "clientId", "comment", "createdAt", "id", "providerId", "rating", "updatedAt" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
