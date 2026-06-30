import cookie, {type FastifyCookieOptions} from '@fastify/cookie';
import fp from 'fastify-plugin';

const cookiePlugin = fp<FastifyCookieOptions>(
    async fastify => {
        await fastify.register(cookie);
    },
    {name: 'cookie'}
);

export default cookiePlugin;
