import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {assignWeaponSchema, getStormtrooperWeaponsSchema, unassignWeaponSchema} from '@/modules/weapons/schemas';
import {
    createStormtrooperSchema,
    deleteStormtrooperSchema,
    getStormtrooperSchema,
    getStormtroopersSchema,
    updateStormtrooperSchema
} from './schemas';
import StormtrooperService from './service';

const stormtroopers: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const stormtroopersService = new StormtrooperService(fastify.prisma);
    const weaponsService = fastify.weaponsService;

    fastify.get('/', {schema: getStormtroopersSchema}, async (req, res): Promise<void> => {
        res.send(await stormtroopersService.getStormtroopers(req.query));
    });

    fastify.post('/', {schema: createStormtrooperSchema}, async (req, res): Promise<void> => {
        res.code(201).send({stormtrooper: await stormtroopersService.createStormtrooper(req.body)});
    });

    fastify.get('/:id', {schema: getStormtrooperSchema}, async (req, res): Promise<void> => {
        res.send({stormtrooper: await stormtroopersService.getStormtrooperById(req.params.id)});
    });

    fastify.patch('/:id', {schema: updateStormtrooperSchema}, async (req, res): Promise<void> => {
        res.send({stormtrooper: await stormtroopersService.updateStormtrooper(req.params.id, req.body)});
    });

    fastify.delete('/:id', {schema: deleteStormtrooperSchema}, async (req, res): Promise<void> => {
        res.send({stormtrooper: await stormtroopersService.deleteStormtrooper(req.params.id)});
    });

    fastify.get('/:id/weapons', {schema: getStormtrooperWeaponsSchema}, async (req, res): Promise<void> => {
        res.send(await weaponsService.getWeaponsByStormtrooper(req.params.id, req.query));
    });

    fastify.put('/:id/weapons/:weaponId', {schema: assignWeaponSchema}, async (req, res): Promise<void> => {
        res.send({weapon: await weaponsService.assignWeaponToStormtrooper(req.params.id, req.params.weaponId)});
    });

    fastify.delete('/:id/weapons/:weaponId', {schema: unassignWeaponSchema}, async (req, res): Promise<void> => {
        res.send({weapon: await weaponsService.unassignWeaponFromStormtrooper(req.params.id, req.params.weaponId)});
    });
};

export default stormtroopers;
