/*
  Warnings:

  - Added the required column `windowEnd` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "windowEnd" TIMESTAMP(3) NOT NULL;
