/*
  Warnings:

  - Added the required column `windowEnd` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `windowStart` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "windowEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "windowStart" TIMESTAMP(3) NOT NULL;
