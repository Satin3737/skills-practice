import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {RedisSubChannel} from '@/common/const';
import {UserRank} from '@/database/prisma/enums';
import {MissionsFeedEvents} from './const';
import {
    assignStormtroopersSchema,
    deleteMissionSchema,
    getMissionSchema,
    getMissionsSchema,
    updateMissionSchema
} from './schemas';
import {subscribeToMissionsFeed} from './subscriber';
import type {IMissionsFeedClient} from './types';

const missions: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const missionsService = fastify.missionsService;
    const missionFeed = fastify.missionFeed;

    await subscribeToMissionsFeed(fastify);

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
            const mission = await missionsService.updateMission(req.params.id, req.body);

            fastify.pushRedisEvent(RedisSubChannel.missionsFeed, {
                event: MissionsFeedEvents.missionUpdated,
                data: {mission}
            });

            res.send({mission});
        }
    );

    fastify.delete(
        '/:id',
        {schema: deleteMissionSchema, onRequest: fastify.authGuard(UserRank.captain)},
        async (req, res): Promise<void> => {
            res.send({mission: await missionsService.deleteMission(req.params.id)});
        }
    );

    fastify.put(
        '/:id/stormtroopers',
        {schema: assignStormtroopersSchema, onRequest: fastify.authGuard(UserRank.captain)},
        async (req, res): Promise<void> => {
            void res.send({
                mission: await missionsService.assignStormtroopersToMission(req.params.id, req.body.stormtroopers)
            });
        }
    );

    fastify.get('/feed', async (_, res): Promise<void> => {
        res.hijack();

        res.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
        });

        res.raw.write(': connected\n\n');

        const sendEvent: IMissionsFeedClient = (event, data) => {
            res.raw.write(`data: ${JSON.stringify({event, data})}\n\n`);
        };

        const unregister = missionFeed.addClient(sendEvent);

        const heartbeat = setInterval(() => {
            res.raw.write(': heartbeat\n\n');
        }, 10_000);

        res.raw.on('close', () => {
            clearInterval(heartbeat);
            unregister();
        });
    });
};

export default missions;
