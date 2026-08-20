import {z} from 'zod';
import {byIdPSchema, paginatedListSchema} from '@/common/schemas';
import {WeaponPlain} from '@/database/models';

export const getWeaponsSchema = {
    querystring: paginatedListSchema,
    response: {
        200: z.object({
            weapons: z.array(WeaponPlain),
            total: z.int()
        })
    }
};

export const getWeaponSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({weapon: WeaponPlain})
    }
};

export const createWeaponSchema = {
    body: z
        .object({
            mark: z.string().min(3).max(255),
            damage: z.int().min(1),
            isDeadly: z.boolean().optional()
        })
        .strict(),
    response: {
        201: z.object({weapon: WeaponPlain})
    }
};

export const updateWeaponSchema = {
    params: byIdPSchema,
    body: createWeaponSchema.body.partial().refine(data => Object.keys(data).length > 0),
    response: {
        200: z.object({weapon: WeaponPlain})
    }
};

export const deleteWeaponSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({weapon: WeaponPlain})
    }
};

const stormtrooperWeaponParams = z.object({
    id: byIdPSchema.shape.id,
    weaponId: z.coerce.number().int()
});

export const getStormtrooperWeaponsSchema = {
    params: byIdPSchema,
    querystring: paginatedListSchema,
    response: {
        200: z.object({weapons: z.array(WeaponPlain), total: z.int()})
    }
};

export const assignWeaponSchema = {
    params: stormtrooperWeaponParams,
    response: {
        200: z.object({weapon: WeaponPlain})
    }
};

export const unassignWeaponSchema = {
    params: stormtrooperWeaponParams,
    response: {
        200: z.object({weapon: WeaponPlain})
    }
};
