import type {Static} from '@fastify/type-provider-typebox';
import type {Stormtrooper, Weapon} from '@/database/prisma/client';
import type MissionsService from '@/modules/missions/service';
import type {IMissionWithPlanet} from '@/modules/missions/types';
import type StormtroopersService from '@/modules/stormtroopers/service';
import type WeaponsService from '@/modules/weapons/service';
import {type Tools, getWeaponInfoTool, listMyMissionsTool} from './tools';

export type ITools = (typeof Tools)[keyof typeof Tools];

export type IToolHandlers = {
    [K in ITools]: (params: IToolExecs[K]['params']) => IToolExecs[K]['res'];
};

export interface IToolExecs {
    [Tools.listMyMissions]: {
        params: {
            input: Static<typeof listMyMissionsTool.input_schema>;
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
            input: Static<typeof getWeaponInfoTool.input_schema>;
            weaponsService: WeaponsService;
        };
        res: Promise<Weapon>;
    };
}
