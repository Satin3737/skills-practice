import type {IEntityListParams} from '@/common/types';
import type {PrismaClient, Weapon} from '@/database/prisma/client';
import type {ICreateWeaponData, IUpdateWeaponData, IWeaponListResponse} from './types';

class WeaponService {
    private readonly db: PrismaClient;

    public constructor(db: PrismaClient) {
        this.db = db;
    }

    public async getWeapons({limit, page, search}: IEntityListParams): Promise<IWeaponListResponse> {
        const where = {mark: {contains: search, mode: 'insensitive'}} as const;

        const [weapons, total] = await this.db.$transaction([
            this.db.weapon.findMany({
                take: limit,
                skip: (page - 1) * limit,
                where
            }),
            this.db.weapon.count({where})
        ]);

        return {weapons, total};
    }

    public getWeaponById(id: number): Promise<Weapon> {
        return this.db.weapon.findUniqueOrThrow({where: {id}});
    }

    public createWeapon(data: ICreateWeaponData): Promise<Weapon> {
        return this.db.weapon.create({data});
    }

    public updateWeapon(id: number, data: IUpdateWeaponData): Promise<Weapon> {
        return this.db.weapon.update({where: {id}, data});
    }

    public deleteWeapon(id: number): Promise<Weapon> {
        return this.db.weapon.delete({where: {id}});
    }

    public async getWeaponsByStormtrooper(
        stormtrooperId: number,
        {limit, page, search}: IEntityListParams
    ): Promise<IWeaponListResponse> {
        const where = {
            mark: {contains: search, mode: 'insensitive'},
            stormtrooper: {some: {id: stormtrooperId}}
        } as const;

        const [weapons, total] = await this.db.$transaction([
            this.db.weapon.findMany({
                take: limit,
                skip: (page - 1) * limit,
                where
            }),
            this.db.weapon.count({where})
        ]);

        return {weapons, total};
    }

    public assignWeaponToStormtrooper(stormtrooperId: number, weaponId: number): Promise<Weapon> {
        return this.db.weapon.update({
            where: {id: weaponId},
            data: {stormtrooper: {connect: {id: stormtrooperId}}}
        });
    }

    public unassignWeaponFromStormtrooper(stormtrooperId: number, weaponId: number): Promise<Weapon> {
        return this.db.weapon.update({
            where: {id: weaponId},
            data: {stormtrooper: {disconnect: {id: stormtrooperId}}}
        });
    }
}

export default WeaponService;
