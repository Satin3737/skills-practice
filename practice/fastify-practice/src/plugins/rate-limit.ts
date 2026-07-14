import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';

const rateLimitPlugin = fp(
    async fastify => {
        await fastify.register(rateLimit, {
            max: 100,
            timeWindow: 60_000,
            redis: fastify.redisFailFast,
            skipOnError: true
        });
    },
    {name: 'rate-limit', dependencies: ['redis']}
);

export default rateLimitPlugin;
