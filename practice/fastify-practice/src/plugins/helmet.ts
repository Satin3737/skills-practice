import helmet from '@fastify/helmet';
import fp from 'fastify-plugin';

const helmetPlugin = fp(
    async fastify => {
        await fastify.register(helmet, {global: true});
    },
    {name: 'helmet'}
);

export default helmetPlugin;
