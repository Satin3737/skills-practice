import type {Static} from '@fastify/type-provider-typebox';
import type {Planet} from '@/database/prisma/client';
import {createPlanetSchema, updatePlanetSchema} from './schemas';

export type ICreatePlanetData = Static<typeof createPlanetSchema.body>;

export type IUpdatePlanetData = Static<typeof updatePlanetSchema.body>;

export interface IPlanetListResponse {
    planets: Planet[];
    total: number;
}
