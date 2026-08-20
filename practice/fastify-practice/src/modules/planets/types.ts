import type {z} from 'zod';
import type {Planet} from '@/database/prisma/client';
import {createPlanetSchema, updatePlanetSchema} from './schemas';

export type ICreatePlanetData = z.infer<typeof createPlanetSchema.body>;

export type IUpdatePlanetData = z.infer<typeof updatePlanetSchema.body>;

export interface IPlanetListResponse {
    planets: Planet[];
    total: number;
}
