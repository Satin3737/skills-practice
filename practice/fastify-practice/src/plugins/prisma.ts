import fastifyPrisma from '@zrosenbauer/fastify-prisma';
import fp from 'fastify-plugin';
import {Database} from '@/database';

const prismaPlugin = fp(
    async fastify => {
        await fastify.register(fastifyPrisma, {client: Database});
    },
    {name: 'prisma'}
);

export default prismaPlugin;
