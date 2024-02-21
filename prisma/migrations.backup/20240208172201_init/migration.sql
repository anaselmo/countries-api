-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "abbreviation" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capital" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Country" ("abbreviation", "capital", "id", "name") SELECT "abbreviation", "capital", "id", "name" FROM "Country";
DROP TABLE "Country";
ALTER TABLE "new_Country" RENAME TO "Country";
CREATE UNIQUE INDEX "Country_abbreviation_key" ON "Country"("abbreviation");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
