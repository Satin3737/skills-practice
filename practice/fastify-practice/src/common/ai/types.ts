import type {z} from 'zod';
import type {IValuesOf} from '@/common/types';
import type {Stormtrooper, Weapon} from '@/database/prisma/client';
import type MissionsService from '@/modules/missions/service';
import type {IMissionWithPlanet} from '@/modules/missions/types';
import type StormtroopersService from '@/modules/stormtroopers/service';
import type WeaponsService from '@/modules/weapons/service';
import {getWeaponInfoInputSchema, listMyMissionsInputSchema} from './schemas';
import type {Tools} from './tools';

export type ITools = IValuesOf<typeof Tools>;

export type IToolHandlers = {
    [K in ITools]: (params: IToolExecs[K]['params']) => IToolExecs[K]['res'];
};

export interface IToolExecs {
    [Tools.listMyMissions]: {
        params: {
            input: z.infer<typeof listMyMissionsInputSchema>;
            context: {stormtrooperId: number};
            missionsService: MissionsService;
        };
        res: Promise<IMissionWithPlanet[]>;
    };
    [Tools.getMyData]: {
        params: {
            context: {stormtrooperId: number};
            stormtroopersService: StormtroopersService;
        };
        res: Promise<Stormtrooper>;
    };
    [Tools.getWeaponInfo]: {
        params: {
            input: z.infer<typeof getWeaponInfoInputSchema>;
            weaponsService: WeaponsService;
        };
        res: Promise<Weapon>;
    };
}
