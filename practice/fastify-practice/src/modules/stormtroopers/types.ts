import type {z} from 'zod';
import type {Stormtrooper} from '@/database/prisma/client';
import {createStormtrooperSchema, updateStormtrooperSchema} from './schemas';

export type ICreateStormtrooperData = z.infer<typeof createStormtrooperSchema.body>;

export type IUpdateStormtrooperData = z.infer<typeof updateStormtrooperSchema.body>;

export interface IStormtrooperListResponse {
    stormtroopers: Stormtrooper[];
    total: number;
}
