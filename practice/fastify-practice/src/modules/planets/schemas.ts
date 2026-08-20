import {z} from 'zod';
import {byIdPSchema, paginatedListSchema} from '@/common/schemas';
import {PlanetPlain} from '@/database/models';
import {PlanetType} from '@/database/prisma/enums';

export const getPlanetsSchema = {
    querystring: paginatedListSchema,
    response: {
        200: z.object({
            planets: z.array(PlanetPlain),
            total: z.int()
        })
    }
};

export const getPlanetSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({planet: PlanetPlain})
    }
};

export const createPlanetSchema = {
    body: z
        .object({
            name: z.string().min(3).max(255),
            size: z.int().min(1),
            type: z.enum(PlanetType),
            hasRings: z.boolean().optional()
        })
        .strict(),
    response: {
        201: z.object({planet: PlanetPlain})
    }
};

export const updatePlanetSchema = {
    params: byIdPSchema,
    body: createPlanetSchema.body.partial().refine(data => Object.keys(data).length > 0),
    response: {
        200: z.object({planet: PlanetPlain})
    }
};

export const deletePlanetSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({planet: PlanetPlain})
    }
};
