-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tourist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Tourist" ("deleted", "email", "id", "name", "password") SELECT "deleted", "email", "id", "name", "password" FROM "Tourist";
DROP TABLE "Tourist";
ALTER TABLE "new_Tourist" RENAME TO "Tourist";
CREATE UNIQUE INDEX "Tourist_email_key" ON "Tourist"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
