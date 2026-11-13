-- AlterTable: backfill existing sessions via a temporary DB default, then drop it (Prisma generates cuid() client-side)
ALTER TABLE "Session" ADD COLUMN "tokenId" TEXT NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE "Session" ALTER COLUMN "tokenId" DROP DEFAULT;
