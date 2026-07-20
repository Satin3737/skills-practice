import {Type} from '@fastify/type-provider-typebox';
import {byIdPSchema, paginatedListSchema} from '@/common/schemas';
import {MissionPlain} from '@/database/prismabox/Mission';
import {PlanetPlain} from '@/database/prismabox/Planet';
import {StormtrooperPlain} from '@/database/prismabox/Stormtrooper';

export const getMissionsSchema = {
    querystring: paginatedListSchema,
    response: {
        200: Type.Object({
            missions: Type.Array(MissionPlain),
            total: Type.Integer()
        })
    }
};

export const getMissionSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({
            mission: Type.Object({...MissionPlain.properties, planet: PlanetPlain})
        })
    }
};

export const createMissionSchema = {
    body: Type.Object(
        {
            title: Type.String({minLength: 3, maxLength: 255}),
            briefing: Type.Optional(Type.String()),
            isCompleted: Type.Optional(Type.Boolean()),
            planetId: Type.Integer({minimum: 1})
        },
        {additionalProperties: false}
    ),
    response: {
        201: Type.Object({mission: MissionPlain})
    }
};

export const updateMissionSchema = {
    params: byIdPSchema,
    body: Type.Partial(createMissionSchema.body, {minProperties: 1, additionalProperties: false}),
    response: {
        200: Type.Object({mission: MissionPlain})
    }
};

export const deleteMissionSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({mission: MissionPlain})
    }
};

export const getMissionsByPlanetSchema = {
    params: byIdPSchema,
    querystring: paginatedListSchema,
    response: {
        200: Type.Object({missions: Type.Array(MissionPlain), total: Type.Integer()})
    }
};

export const createMissionsForPlanetSchema = {
    params: byIdPSchema,
    body: Type.Array(Type.Omit(createMissionSchema.body, ['planetId'], {additionalProperties: false})),
    response: {
        201: Type.Object({missions: Type.Array(MissionPlain)})
    }
};

export const assignStormtroopersSchema = {
    params: byIdPSchema,
    body: Type.Object(
        {stormtroopers: Type.Array(Type.Integer({minimum: 1}), {minItems: 1})},
        {additionalProperties: false}
    ),
    response: {
        200: Type.Object({
            mission: Type.Object({...MissionPlain.properties, stormtroopers: Type.Array(StormtrooperPlain)})
        })
    }
};
