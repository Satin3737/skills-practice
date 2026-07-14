import cookie from '@fastify/cookie';
import fp from 'fastify-plugin';

const cookiePlugin = fp(
    async fastify => {
        await fastify.register(cookie);
    },
    {name: 'cookie'}
);

export default cookiePlugin;
