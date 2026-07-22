import {fastifyRedis} from '@fastify/redis';
import fp from 'fastify-plugin';
import type {IRedisChannelPayloads} from '@/types/redis';

const redisPlugin = fp(
    async fastify => {
        const url = fastify.config.REDIS_URL;

        await fastify.register(fastifyRedis, {url});

        await fastify.register(fastifyRedis, {url, namespace: 'sub'});

        await fastify.register(fastifyRedis, {
            url,
            namespace: 'failFast',
            maxRetriesPerRequest: 1,
            connectTimeout: 500
        });

        await fastify.register(fastifyRedis, {
            url,
            namespace: 'bullMq',
            maxRetriesPerRequest: null
        });

        fastify.decorate('redisSub', fastify.redis.sub);
        fastify.decorate('redisFailFast', fastify.redis.failFast);
        fastify.decorate('redisBullMq', fastify.redis.bullMq);

        fastify.decorate(
            'pushRedisEvent',
            <C extends keyof IRedisChannelPayloads>(channel: C, message: IRedisChannelPayloads[C]): void => {
                fastify.redis
                    .publish(channel, JSON.stringify(message))
                    .catch(err => fastify.log.error({err}, 'Failed to publish event'));
            }
        );
    },
    {name: 'redis', dependencies: ['env']}
);

export default redisPlugin;
