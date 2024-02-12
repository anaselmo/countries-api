-- CreateTable
CREATE TABLE "Country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "abbreviation" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capital" TEXT
);

-- CreateTable
CREATE TABLE "Tourist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "countryId" INTEGER NOT NULL,
    "touristId" INTEGER NOT NULL,
    CONSTRAINT "Visit_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_abbreviation_key" ON "Country"("abbreviation");
