import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {createWeaponSchema, deleteWeaponSchema, getWeaponSchema, getWeaponsSchema, updateWeaponSchema} from './schemas';

const weapons: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const weaponsService = fastify.weaponsService;

    fastify.get('/', {schema: getWeaponsSchema}, async (req, res): Promise<void> => {
        res.send(await weaponsService.getWeapons(req.query));
    });

    fastify.post('/', {schema: createWeaponSchema}, async (req, res): Promise<void> => {
        res.code(201).send({weapon: await weaponsService.createWeapon(req.body)});
    });

    fastify.get('/:id', {schema: getWeaponSchema}, async (req, res): Promise<void> => {
        res.send({weapon: await weaponsService.getWeaponById(req.params.id)});
    });

    fastify.patch('/:id', {schema: updateWeaponSchema}, async (req, res): Promise<void> => {
        res.send({weapon: await weaponsService.updateWeapon(req.params.id, req.body)});
    });

    fastify.delete('/:id', {schema: deleteWeaponSchema}, async (req, res): Promise<void> => {
        res.send({weapon: await weaponsService.deleteWeapon(req.params.id)});
    });
};

export default weapons;
