/*
  Warnings:

  - You are about to drop the column `type` on the `Stormtrooper` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('trooper', 'captain', 'admiral', 'emperor');

-- AlterTable
ALTER TABLE "Stormtrooper" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type" "UserType" NOT NULL DEFAULT 'trooper';

-- DropEnum
DROP TYPE "StormtrooperType";
