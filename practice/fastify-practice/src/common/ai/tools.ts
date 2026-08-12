import type {Tool} from '@anthropic-ai/sdk/resources';
import {Type} from '@sinclair/typebox';

export const Tools = {
    listMyMissions: 'list_my_missions',
    getMyData: 'get_my_data',
    getWeaponInfo: 'get_weapon_info'
} as const;

export const listMyMissionsTool = {
    name: Tools.listMyMissions,
    description: 'Returns the list of missions assigned to the current stormtrooper, including completion status.',
    input_schema: Type.Object({
        onlyIncomplete: Type.Optional(
            Type.Boolean({description: 'If true, return only missions that are not yet completed'})
        )
    })
} as const satisfies Tool;

export const getMyStormtrooperDataTool = {
    name: Tools.getMyData,
    description: 'Returns the stormtrooper data for the current user, including call sign and rank.',
    input_schema: Type.Object({})
} as const satisfies Tool;

export const getWeaponInfoTool = {
    name: Tools.getWeaponInfo,
    description:
        'Returns information about a specific weapon used by the Galactic Empire, including stats and specifications.',
    input_schema: Type.Object({
        weaponId: Type.Number({description: 'The ID of the weapon to retrieve information for'})
    })
} as const satisfies Tool;

export const allTools = [listMyMissionsTool, getMyStormtrooperDataTool, getWeaponInfoTool] as const satisfies Tool[];
