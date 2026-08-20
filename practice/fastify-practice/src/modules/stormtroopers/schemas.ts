import {z} from 'zod';
import {byIdPSchema, paginatedListSchema} from '@/common/schemas';
import {StormtrooperPlain} from '@/database/models';

export const getStormtroopersSchema = {
    querystring: paginatedListSchema,
    response: {
        200: z.object({
            stormtroopers: z.array(StormtrooperPlain),
            total: z.int()
        })
    }
};

export const getStormtrooperSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({stormtrooper: StormtrooperPlain})
    }
};

export const createStormtrooperSchema = {
    body: z
        .object({
            callSign: z.string().min(3).max(255)
        })
        .strict(),
    response: {
        201: z.object({stormtrooper: StormtrooperPlain})
    }
};

export const updateStormtrooperSchema = {
    params: byIdPSchema,
    body: createStormtrooperSchema.body.partial().refine(data => Object.keys(data).length > 0),
    response: {
        200: z.object({stormtrooper: StormtrooperPlain})
    }
};

export const deleteStormtrooperSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({stormtrooper: StormtrooperPlain})
    }
};
