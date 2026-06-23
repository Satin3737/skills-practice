-- CreateEnum
CREATE TYPE "StormtrooperType" AS ENUM ('trooper', 'pilot', 'sniper', 'captain');

-- CreateEnum
CREATE TYPE "PlanetType" AS ENUM ('dwarf', 'gasGiant', 'satellite', 'exoplanet');

-- AlterTable
ALTER TABLE "Planet" ADD COLUMN     "type" "PlanetType" NOT NULL DEFAULT 'exoplanet';

-- AlterTable
ALTER TABLE "Stormtrooper" ADD COLUMN     "type" "StormtrooperType" NOT NULL DEFAULT 'trooper';
