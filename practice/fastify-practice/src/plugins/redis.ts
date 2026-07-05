import {type FastifyRedisPluginOptions, fastifyRedis} from '@fastify/redis';
import fp from 'fastify-plugin';

const redisPlugin = fp<FastifyRedisPluginOptions>(
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

        fastify.decorate('redisSub', fastify.redis.sub);
        fastify.decorate('redisFailFast', fastify.redis.failFast);
    },
    {name: 'redis', dependencies: ['env']}
);

export default redisPlugin;
