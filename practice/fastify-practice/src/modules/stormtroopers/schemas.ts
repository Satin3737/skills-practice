import {Type} from '@fastify/type-provider-typebox';
import {byIdPSchema, paginatedListSchema} from '@/common/schemas';
import {StormtrooperType} from '@/database/prisma/enums';
import {StormtrooperPlain} from '@/database/prismabox/Stormtrooper';

export const getStormtroopersSchema = {
    querystring: paginatedListSchema,
    response: {
        200: Type.Object({
            stormtroopers: Type.Array(StormtrooperPlain),
            total: Type.Integer()
        })
    }
};

export const getStormtrooperSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({stormtrooper: StormtrooperPlain})
    }
};

export const createStormtrooperSchema = {
    body: Type.Object(
        {
            callSign: Type.String({minLength: 3, maxLength: 255}),
            email: Type.String({pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'}),
            type: Type.Optional(Type.Enum(StormtrooperType))
        },
        {additionalProperties: false}
    ),
    response: {
        201: Type.Object({stormtrooper: StormtrooperPlain})
    }
};

export const updateStormtrooperSchema = {
    params: byIdPSchema,
    body: Type.Partial(createStormtrooperSchema.body, {minProperties: 1}),
    response: {
        200: Type.Object({stormtrooper: StormtrooperPlain})
    }
};

export const deleteStormtrooperSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({stormtrooper: StormtrooperPlain})
    }
};
