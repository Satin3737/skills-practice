import type {Static} from '@fastify/type-provider-typebox';
import type {Mission} from '@/database/prisma/client';
import type {MissionGetPayload} from '@/database/prisma/models/Mission';
import {createMissionSchema, updateMissionSchema} from './schemas';

export type ICreateMissionData = Static<typeof createMissionSchema.body>;

export type ICreatePlanetMissionsData = Omit<ICreateMissionData, 'planetId'>;

export type IUpdateMissionData = Static<typeof updateMissionSchema.body>;

export type IMissionWithPlanet = MissionGetPayload<{include: {planet: true}}>;

export interface IMissionListResponse {
    missions: Mission[];
    total: number;
}
