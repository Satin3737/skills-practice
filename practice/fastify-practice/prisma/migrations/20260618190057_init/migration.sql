-- CreateTable
CREATE TABLE "Stormtrooper" (
    "id" SERIAL NOT NULL,
    "callSign" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Stormtrooper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" SERIAL NOT NULL,
    "mark" TEXT NOT NULL,
    "content" TEXT,
    "deadly" BOOLEAN NOT NULL,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "briefing" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "planetId" INTEGER NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "Planet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StormtrooperToWeapon" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StormtrooperToWeapon_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MissionToStormtrooper" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MissionToStormtrooper_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stormtrooper_email_key" ON "Stormtrooper"("email");

-- CreateIndex
CREATE INDEX "_StormtrooperToWeapon_B_index" ON "_StormtrooperToWeapon"("B");

-- CreateIndex
CREATE INDEX "_MissionToStormtrooper_B_index" ON "_MissionToStormtrooper"("B");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StormtrooperToWeapon" ADD CONSTRAINT "_StormtrooperToWeapon_A_fkey" FOREIGN KEY ("A") REFERENCES "Stormtrooper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StormtrooperToWeapon" ADD CONSTRAINT "_StormtrooperToWeapon_B_fkey" FOREIGN KEY ("B") REFERENCES "Weapon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MissionToStormtrooper" ADD CONSTRAINT "_MissionToStormtrooper_A_fkey" FOREIGN KEY ("A") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MissionToStormtrooper" ADD CONSTRAINT "_MissionToStormtrooper_B_fkey" FOREIGN KEY ("B") REFERENCES "Stormtrooper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
