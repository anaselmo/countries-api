/*
  Warnings:

  - Added the required column `email` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Tourist` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tourist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Tourist" ("deleted", "id", "name") SELECT "deleted", "id", "name" FROM "Tourist";
DROP TABLE "Tourist";
ALTER TABLE "new_Tourist" RENAME TO "Tourist";
CREATE UNIQUE INDEX "Tourist_email_key" ON "Tourist"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
