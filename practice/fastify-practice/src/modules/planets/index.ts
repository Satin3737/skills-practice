import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {UserType} from '@/database/prisma/enums';
import {createMissionsForPlanetSchema, getMissionsByPlanetSchema} from '@/modules/missions/schemas';
import PlanetsService from '@/modules/planets/service';
import {createPlanetSchema, deletePlanetSchema, getPlanetSchema, getPlanetsSchema, updatePlanetSchema} from './schemas';

const planets: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const planetsService = new PlanetsService(fastify.prisma);
    const missionsService = fastify.missionsService;

    fastify.get('/', {schema: getPlanetsSchema}, async (req, res): Promise<void> => {
        res.send(await planetsService.getPlanets(req.query));
    });

    fastify.post(
        '/',
        {schema: createPlanetSchema, onRequest: fastify.authGuard(UserType.emperor)},
        async (req, res): Promise<void> => {
            res.code(201).send({planet: await planetsService.createPlanet(req.body)});
        }
    );

    fastify.get('/:id', {schema: getPlanetSchema}, async (req, res): Promise<void> => {
        res.send({planet: await planetsService.getPlanetById(req.params.id)});
    });

    fastify.patch(
        '/:id',
        {schema: updatePlanetSchema, onRequest: fastify.authGuard(UserType.emperor)},
        async (req, res): Promise<void> => {
            res.send({planet: await planetsService.updatePlanet(req.params.id, req.body)});
        }
    );

    fastify.delete(
        '/:id',
        {schema: deletePlanetSchema, onRequest: fastify.authGuard(UserType.emperor)},
        async (req, res): Promise<void> => {
            res.send({planet: await planetsService.deletePlanet(req.params.id)});
        }
    );

    fastify.get(
        '/:id/missions',
        {schema: getMissionsByPlanetSchema, onRequest: fastify.authGuard(UserType.trooper)},
        async (req, res): Promise<void> => {
            res.send(await missionsService.getMissionsByPlanet(req.params.id, req.query));
        }
    );

    fastify.post(
        '/:id/missions',
        {schema: createMissionsForPlanetSchema, onRequest: fastify.authGuard(UserType.captain)},
        async (req, res): Promise<void> => {
            res.code(201).send({missions: await missionsService.createMissionsForPlanet(req.params.id, req.body)});
        }
    );
};

export default planets;
