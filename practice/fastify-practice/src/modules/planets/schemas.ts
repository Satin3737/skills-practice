import {Type} from '@fastify/type-provider-typebox';
import {byIdPSchema, paginatedListSchema} from '@/common/schemas';
import {PlanetType} from '@/database/prisma/enums';
import {PlanetPlain} from '@/database/prismabox/Planet';

export const getPlanetsSchema = {
    querystring: paginatedListSchema,
    response: {
        200: Type.Object({
            planets: Type.Array(PlanetPlain),
            total: Type.Integer()
        })
    }
};

export const getPlanetSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({planet: PlanetPlain})
    }
};

export const createPlanetSchema = {
    body: Type.Object(
        {
            name: Type.String({minLength: 3, maxLength: 255}),
            size: Type.Integer({minimum: 1}),
            type: Type.Enum(PlanetType),
            hasRings: Type.Optional(Type.Boolean())
        },
        {additionalProperties: false}
    ),
    response: {
        201: Type.Object({planet: PlanetPlain})
    }
};

export const updatePlanetSchema = {
    params: byIdPSchema,
    body: Type.Partial(createPlanetSchema.body, {minProperties: 1}),
    response: {
        200: Type.Object({planet: PlanetPlain})
    }
};

export const deletePlanetSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({planet: PlanetPlain})
    }
};
