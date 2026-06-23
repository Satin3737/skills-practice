import cors, {type FastifyCorsOptions} from '@fastify/cors';
import fp from 'fastify-plugin';

const corsPlugin = fp<FastifyCorsOptions>(async fastify => {
    await fastify.register(cors, {origin: process.env.CORS_ORIGIN ?? '*'});
});

export default corsPlugin;
