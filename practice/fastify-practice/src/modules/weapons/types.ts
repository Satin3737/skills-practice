import type {Static} from '@fastify/type-provider-typebox';
import type {Weapon} from '@/database/prisma/client';
import {createWeaponSchema, updateWeaponSchema} from './schemas';

export type ICreateWeaponData = Static<typeof createWeaponSchema.body>;

export type IUpdateWeaponData = Static<typeof updateWeaponSchema.body>;

export interface IWeaponListResponse {
    weapons: Weapon[];
    total: number;
}
