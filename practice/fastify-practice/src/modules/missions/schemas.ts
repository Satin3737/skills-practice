import {z} from 'zod';
import {byIdPSchema, paginatedListSchema} from '@/common/schemas';
import {MissionPlain, PlanetPlain, StormtrooperPlain} from '@/database/models';

export const getMissionsSchema = {
    querystring: paginatedListSchema,
    response: {
        200: z.object({
            missions: z.array(MissionPlain),
            total: z.int()
        })
    }
};

export const getMissionSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({
            mission: MissionPlain.extend({planet: PlanetPlain})
        })
    }
};

export const createMissionSchema = {
    body: z
        .object({
            title: z.string().min(3).max(255),
            briefing: z.string().optional(),
            isCompleted: z.boolean().optional(),
            planetId: z.int().min(1)
        })
        .strict(),
    response: {
        201: z.object({mission: MissionPlain})
    }
};

export const updateMissionSchema = {
    params: byIdPSchema,
    body: createMissionSchema.body.partial().refine(data => Object.keys(data).length > 0),
    response: {
        200: z.object({mission: MissionPlain})
    }
};

export const deleteMissionSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({mission: MissionPlain})
    }
};

export const getMissionsByPlanetSchema = {
    params: byIdPSchema,
    querystring: paginatedListSchema,
    response: {
        200: z.object({missions: z.array(MissionPlain), total: z.int()})
    }
};

export const createMissionsForPlanetSchema = {
    params: byIdPSchema,
    body: z.array(createMissionSchema.body.omit({planetId: true})),
    response: {
        201: z.object({missions: z.array(MissionPlain)})
    }
};

export const assignStormtroopersSchema = {
    params: byIdPSchema,
    body: z.object({stormtroopers: z.array(z.int().min(1)).min(1)}).strict(),
    response: {
        200: z.object({
            mission: MissionPlain.extend({stormtroopers: z.array(StormtrooperPlain)})
        })
    }
};
