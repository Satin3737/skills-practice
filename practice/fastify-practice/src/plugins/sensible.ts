import sensible from '@fastify/sensible';
import fp from 'fastify-plugin';

const sensiblePlugin = fp(
    async fastify => {
        await fastify.register(sensible);
    },
    {name: 'sensible'}
);

export default sensiblePlugin;
