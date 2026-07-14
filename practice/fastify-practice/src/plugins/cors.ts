import cors from '@fastify/cors';
import fp from 'fastify-plugin';

const corsPlugin = fp(
    async fastify => {
        await fastify.register(cors, {origin: fastify.config.CORS_ORIGIN});
    },
    {name: 'cors', dependencies: ['env']}
);

export default corsPlugin;
