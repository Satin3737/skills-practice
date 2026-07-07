import type {Static} from '@fastify/type-provider-typebox';
import type {IValuesOf} from '@/common/types';
import type {Mission} from '@/database/prisma/client';
import type {MissionGetPayload} from '@/database/prisma/models/Mission';
import {MissionsFeedEvents} from './const';
import {createMissionSchema, updateMissionSchema} from './schemas';

export type ICreateMissionData = Static<typeof createMissionSchema.body>;

export type ICreatePlanetMissionsData = Omit<ICreateMissionData, 'planetId'>;

export type IUpdateMissionData = Static<typeof updateMissionSchema.body>;

export type IMissionWithPlanet = MissionGetPayload<{include: {planet: true}}>;

export interface IMissionListResponse {
    missions: Mission[];
    total: number;
}

export type IMissionsFeedEvents = IValuesOf<typeof MissionsFeedEvents>;

export interface IMissionsFeedData {
    [MissionsFeedEvents.missionUpdated]: {mission: Mission};
    [MissionsFeedEvents.missionsCreated]: {missions: Mission[]};
}

export type IMissionsFeedClient = (event: IMissionsFeedEvents, data: IMissionsFeedData[typeof event]) => void;

export type IMissionFeedMessage = {
    [Event in IMissionsFeedEvents]: {
        event: Event;
        data: IMissionsFeedData[Event];
    };
}[IMissionsFeedEvents];
