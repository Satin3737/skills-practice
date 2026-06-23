-- AlterTable
ALTER TABLE "Mission" RENAME COLUMN "completed" TO  "isCompleted";

-- AlterTable
ALTER TABLE "Weapon" RENAME COLUMN "deadly" TO "isDeadly";

-- AlterTable
ALTER TABLE "Weapon" ALTER COLUMN "isDeadly" SET DEFAULT false;
