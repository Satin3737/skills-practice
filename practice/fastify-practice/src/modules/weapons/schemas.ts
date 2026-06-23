import {Type} from '@fastify/type-provider-typebox';
import {byIdPSchema, paginatedListSchema} from '@/common/schemas';
import {WeaponPlain} from '@/database/prismabox/Weapon';

export const getWeaponsSchema = {
    querystring: paginatedListSchema,
    response: {
        200: Type.Object({
            weapons: Type.Array(WeaponPlain),
            total: Type.Integer()
        })
    }
};

export const getWeaponSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({weapon: WeaponPlain})
    }
};

export const createWeaponSchema = {
    body: Type.Object(
        {
            mark: Type.String({minLength: 3, maxLength: 255}),
            damage: Type.Integer({minimum: 1}),
            isDeadly: Type.Optional(Type.Boolean())
        },
        {additionalProperties: false}
    ),
    response: {
        201: Type.Object({weapon: WeaponPlain})
    }
};

export const updateWeaponSchema = {
    params: byIdPSchema,
    body: Type.Partial(createWeaponSchema.body, {minProperties: 1}),
    response: {
        200: Type.Object({weapon: WeaponPlain})
    }
};

export const deleteWeaponSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({weapon: WeaponPlain})
    }
};

const stormtrooperWeaponParams = Type.Object({
    id: byIdPSchema.properties.id,
    weaponId: Type.Integer()
});

export const getStormtrooperWeaponsSchema = {
    params: byIdPSchema,
    querystring: paginatedListSchema,
    response: {
        200: Type.Object({weapons: Type.Array(WeaponPlain), total: Type.Integer()})
    }
};

export const assignWeaponSchema = {
    params: stormtrooperWeaponParams,
    response: {
        200: Type.Object({weapon: WeaponPlain})
    }
};

export const unassignWeaponSchema = {
    params: stormtrooperWeaponParams,
    response: {
        200: Type.Object({weapon: WeaponPlain})
    }
};
