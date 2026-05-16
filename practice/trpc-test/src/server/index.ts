import cors from '@fastify/cors';
import {type FastifyTRPCPluginOptions, fastifyTRPCPlugin} from '@trpc/server/adapters/fastify';
import Fastify from 'fastify';
import {type AppRouter, appRouter} from './router.ts';

const fastify = Fastify({logger: true});

await fastify.register(cors, {origin: 'http://localhost:5177'});

await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
        router: appRouter,
        createContext: ({req}) => ({
            headers: req.headers
        })
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions']
});

fastify.get('/health', () => ({status: 'ok'}));

try {
    await fastify.listen({port: 8080});
    fastify.log.info('Server running at http://localhost:8080');
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
