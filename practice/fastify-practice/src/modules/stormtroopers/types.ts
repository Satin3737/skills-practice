import type {Static} from '@fastify/type-provider-typebox';
import type {Stormtrooper} from '@/database/prisma/client';
import {createStormtrooperSchema, updateStormtrooperSchema} from './schemas';

export type ICreateStormtrooperData = Static<typeof createStormtrooperSchema.body>;

export type IUpdateStormtrooperData = Static<typeof updateStormtrooperSchema.body>;

export interface IStormtrooperListResponse {
    stormtroopers: Stormtrooper[];
    total: number;
}
