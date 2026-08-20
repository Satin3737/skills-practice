import type {Tool} from '@anthropic-ai/sdk/resources';
import {
    getMyStormtrooperDataInputSchema,
    getWeaponInfoInputSchema,
    listMyMissionsInputSchema,
    toInputSchema
} from './schemas';

export const Tools = {
    listMyMissions: 'list_my_missions',
    getMyData: 'get_my_data',
    getWeaponInfo: 'get_weapon_info'
} as const;

export const listMyMissionsTool = {
    name: Tools.listMyMissions,
    description: 'Returns the list of missions assigned to the current stormtrooper, including completion status.',
    input_schema: toInputSchema(listMyMissionsInputSchema)
} as const satisfies Tool;

export const getMyStormtrooperDataTool = {
    name: Tools.getMyData,
    description: 'Returns the stormtrooper data for the current user, including call sign and rank.',
    input_schema: toInputSchema(getMyStormtrooperDataInputSchema)
} as const satisfies Tool;

export const getWeaponInfoTool = {
    name: Tools.getWeaponInfo,
    description:
        'Returns information about a specific weapon used by the Galactic Empire, including stats and specifications.',
    input_schema: toInputSchema(getWeaponInfoInputSchema)
} as const satisfies Tool;

export const allTools = [listMyMissionsTool, getMyStormtrooperDataTool, getWeaponInfoTool] as const satisfies Tool[];
