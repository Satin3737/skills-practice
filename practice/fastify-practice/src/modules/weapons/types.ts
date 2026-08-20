import type {z} from 'zod';
import type {Weapon} from '@/database/prisma/client';
import {createWeaponSchema, updateWeaponSchema} from './schemas';

export type ICreateWeaponData = z.infer<typeof createWeaponSchema.body>;

export type IUpdateWeaponData = z.infer<typeof updateWeaponSchema.body>;

export interface IWeaponListResponse {
    weapons: Weapon[];
    total: number;
}
