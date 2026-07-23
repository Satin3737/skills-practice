import 'dotenv/config';
import {Database} from '@/database';
import {AccountProvider, PlanetType, UserRank} from '@/database/prisma/enums';
import {hashPassword} from '@/modules/auth/helper';

const createTrooperUser = async (
    callSign: string,
    email: string,
    rank: UserRank,
    password: string,
    weaponIds: number[],
    missionIds: number[]
) => {
    const stormtrooper = await Database.stormtrooper.create({
        data: {
            callSign,
            weapons: {connect: weaponIds.map(id => ({id}))},
            missions: {connect: missionIds.map(id => ({id}))}
        }
    });

    return Database.user.create({data: {email, password, rank, stormtrooperId: stormtrooper.id}});
};

const seed = async (): Promise<void> => {
    await Database.user.deleteMany();
    await Database.stormtrooper.deleteMany();
    await Database.weapon.deleteMany();
    await Database.mission.deleteMany();
    await Database.planet.deleteMany();

    const [tatooine, hoth, naboo, alderaan, endor, bespin, dagobah] = await Promise.all([
        Database.planet.create({data: {name: 'Tatooine', size: 10465, type: PlanetType.exoplanet}}),
        Database.planet.create({data: {name: 'Hoth', size: 7200, type: PlanetType.exoplanet}}),
        Database.planet.create({data: {name: 'Naboo', size: 12120, type: PlanetType.exoplanet}}),
        Database.planet.create({data: {name: 'Alderaan', size: 12500, type: PlanetType.exoplanet}}),
        Database.planet.create({data: {name: 'Endor', size: 4900, type: PlanetType.satellite}}),
        Database.planet.create({data: {name: 'Bespin', size: 118000, type: PlanetType.gasGiant, hasRings: true}}),
        Database.planet.create({data: {name: 'Dagobah', size: 8900, type: PlanetType.dwarf}})
    ]);

    const missions = await Database.mission.createManyAndReturn({
        data: [
            {title: 'Recover the droids', planetId: tatooine.id},
            {title: 'Rescue Obi-Wan', briefing: 'Extract from Mos Eisley', planetId: tatooine.id, isCompleted: true},
            {title: 'Defend the base', briefing: 'Hold the line', planetId: hoth.id},
            {title: 'Evacuate Echo Base', planetId: hoth.id, isCompleted: true},
            {title: 'Escort the queen', planetId: naboo.id},
            {title: 'Secure the palace', planetId: naboo.id, isCompleted: true},
            {title: 'Investigate the rebellion', planetId: alderaan.id},
            {title: 'Destroy the shield generator', planetId: endor.id, isCompleted: true},
            {title: 'Scout the forest moon', planetId: endor.id},
            {title: 'Negotiate with the Baron', planetId: bespin.id},
            {title: 'Train the apprentice', briefing: 'Patience, young one', planetId: dagobah.id}
        ]
    });

    const [e11, dlt19, dl44, vibroblade, detonator, ionCannon] = await Promise.all([
        Database.weapon.create({data: {mark: 'E-11 Blaster', damage: 40}}),
        Database.weapon.create({data: {mark: 'DLT-19', damage: 55}}),
        Database.weapon.create({data: {mark: 'DL-44 Pistol', damage: 35}}),
        Database.weapon.create({data: {mark: 'Vibroblade', damage: 25, isDeadly: true}}),
        Database.weapon.create({data: {mark: 'Thermal Detonator', damage: 100, isDeadly: true}}),
        Database.weapon.create({data: {mark: 'Ion Cannon', damage: 70}})
    ]);

    const password = await hashPassword('password123');

    await Promise.all([
        createTrooperUser('Palpatine', 'emperor@empire.com', UserRank.emperor, password, [vibroblade.id], []),
        createTrooperUser(
            'Thrawn',
            'admiral@empire.com',
            UserRank.admiral,
            password,
            [ionCannon.id, dlt19.id],
            [missions[7].id]
        ),
        createTrooperUser(
            'Piett',
            'captain@empire.com',
            UserRank.captain,
            password,
            [dl44.id],
            [missions[2].id, missions[3].id]
        ),
        createTrooperUser('TK-421', 'trooper@empire.com', UserRank.trooper, password, [e11.id], [missions[0].id])
    ]);

    await Database.stormtrooper.createMany({
        data: [{callSign: 'TK-422'}, {callSign: 'TK-999'}, {callSign: 'FN-2187'}, {callSign: 'TK-141'}]
    });

    const smugglerStormtrooper = await Database.stormtrooper.create({data: {callSign: 'Solo'}});
    await Database.user.create({
        data: {
            email: 'han@smugglers.com',
            rank: UserRank.trooper,
            stormtrooperId: smugglerStormtrooper.id,
            accounts: {create: {provider: AccountProvider.github, providerAccountId: '123456'}}
        }
    });

    console.log(
        `Seed completed: 7 planets, ${missions.length} missions, ` +
            `${[e11, dlt19, dl44, vibroblade, detonator, ionCannon].length} weapons, 9 stormtroopers, 5 users`
    );
};

seed()
    .catch(err => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => Database.$disconnect());
