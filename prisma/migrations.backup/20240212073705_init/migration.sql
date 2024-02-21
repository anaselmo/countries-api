-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tourist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Tourist" ("id", "name") SELECT "id", "name" FROM "Tourist";
DROP TABLE "Tourist";
ALTER TABLE "new_Tourist" RENAME TO "Tourist";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
