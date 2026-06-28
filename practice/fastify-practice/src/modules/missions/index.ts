import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {UserRank} from '@/database/prisma/enums';
import {deleteMissionSchema, getMissionSchema, getMissionsSchema, updateMissionSchema} from './schemas';

const missions: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const missionsService = fastify.missionsService;

    fastify.get(
        '/',
        {schema: getMissionsSchema, onRequest: fastify.authGuard(UserRank.trooper)},
        async (req, res): Promise<void> => {
            res.send(await missionsService.getMissions(req.query));
        }
    );

    fastify.get(
        '/:id',
        {schema: getMissionSchema, onRequest: fastify.authGuard(UserRank.trooper)},
        async (req, res): Promise<void> => {
            res.send({mission: await missionsService.getMissionById(req.params.id)});
        }
    );

    fastify.patch(
        '/:id',
        {schema: updateMissionSchema, onRequest: fastify.authGuard(UserRank.captain)},
        async (req, res): Promise<void> => {
            res.send({mission: await missionsService.updateMission(req.params.id, req.body)});
        }
    );

    fastify.delete(
        '/:id',
        {schema: deleteMissionSchema, onRequest: fastify.authGuard(UserRank.captain)},
        async (req, res): Promise<void> => {
            res.send({mission: await missionsService.deleteMission(req.params.id)});
        }
    );
};

export default missions;
