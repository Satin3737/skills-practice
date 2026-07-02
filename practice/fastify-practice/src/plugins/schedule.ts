import {fastifySchedule} from '@fastify/schedule';
import fp from 'fastify-plugin';

const schedulePlugin = fp(
    async fastify => {
        await fastify.register(fastifySchedule);
    },
    {name: 'schedule', dependencies: ['prisma']}
);

export default schedulePlugin;
