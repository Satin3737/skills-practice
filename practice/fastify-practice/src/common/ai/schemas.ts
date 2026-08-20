import type {Tool} from '@anthropic-ai/sdk/resources';
import {z} from 'zod';
import type {JSONSchema} from 'zod/v4/core';

export const listMyMissionsInputSchema = z.object({
    onlyIncomplete: z.boolean().describe('If true, return only missions that are not yet completed').optional()
});

export const getMyStormtrooperDataInputSchema = z.object({});

export const getWeaponInfoInputSchema = z.object({
    weaponId: z.number().describe('The ID of the weapon to retrieve information for')
});

const isObjectJSONSchema = (schema: JSONSchema.BaseSchema): schema is JSONSchema.ObjectSchema => {
    return schema.type === 'object';
};

export const toInputSchema = (schema: z.ZodObject): Tool.InputSchema => {
    const jsonSchema = z.toJSONSchema(schema);
    if (!isObjectJSONSchema(jsonSchema)) throw new Error('Expected an object JSON schema');
    return jsonSchema;
};
