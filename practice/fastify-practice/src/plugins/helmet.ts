import helmet, {type FastifyHelmetOptions} from '@fastify/helmet';
import fp from 'fastify-plugin';

const helmetPlugin = fp<FastifyHelmetOptions>(
    async fastify => {
        await fastify.register(helmet, {global: true});
    },
    {name: 'helmet'}
);

export default helmetPlugin;
