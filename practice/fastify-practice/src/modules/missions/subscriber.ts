import type {FastifyInstance} from 'fastify';
import {RedisSubChannel} from '@/common/const';
import type {IMissionFeedMessage} from './types';

export const subscribeToMissionsFeed = async (fastify: FastifyInstance): Promise<void> => {
    await fastify.redisSub.subscribe(RedisSubChannel.missionsFeed);

    fastify.redisSub.on('message', (channel, message) => {
        if (channel !== RedisSubChannel.missionsFeed) return;
        const parsedMessage = JSON.parse(message) as IMissionFeedMessage;
        fastify.missionFeed.broadcast(parsedMessage.event, parsedMessage.data);
    });
};
