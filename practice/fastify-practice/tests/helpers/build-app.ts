import type {FastifyInstance} from 'fastify';
import Server from '@/server';

export const buildTestApp = async (): Promise<FastifyInstance> => {
    const server = new Server();
    return server.build();
};
