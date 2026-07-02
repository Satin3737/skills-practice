import rateLimit, {type FastifyRateLimitOptions} from '@fastify/rate-limit';
import fp from 'fastify-plugin';

const rateLimitPlugin = fp<FastifyRateLimitOptions>(
    async fastify => {
        await fastify.register(rateLimit, {
            max: 100,
            timeWindow: 60_000
        });
    },
    {name: 'rate-limit'}
);

export default rateLimitPlugin;
