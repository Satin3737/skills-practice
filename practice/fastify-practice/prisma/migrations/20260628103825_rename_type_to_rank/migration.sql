-- Rename the enum type, preserving its values (and any column defaults referencing it)
ALTER TYPE "UserType" RENAME TO "UserRank";

-- Rename the column, preserving existing user data and its default
ALTER TABLE "User" RENAME COLUMN "type" TO "rank";