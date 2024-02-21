/*
  Warnings:

  - A unique constraint covering the columns `[date,countryId,touristId]` on the table `Visit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Visit_date_countryId_touristId_key" ON "Visit"("date", "countryId", "touristId");
