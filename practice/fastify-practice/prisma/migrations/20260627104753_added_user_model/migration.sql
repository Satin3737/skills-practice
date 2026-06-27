/*
  Warnings:

  - You are about to drop the column `email` on the `Stormtrooper` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Stormtrooper_email_key";

-- AlterTable
ALTER TABLE "Stormtrooper" DROP COLUMN "email";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "stormtrooperId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stormtrooperId_key" ON "User"("stormtrooperId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_stormtrooperId_fkey" FOREIGN KEY ("stormtrooperId") REFERENCES "Stormtrooper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
