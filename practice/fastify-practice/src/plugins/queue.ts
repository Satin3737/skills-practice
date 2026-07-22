import {Queue} from 'bullmq';
import fp from 'fastify-plugin';
import {QueueType} from '@/common/const';
import type {IEmailOptions} from '@/common/email/types';

const queuePlugin = fp(
    async fastify => {
        const emailQueue = new Queue<IEmailOptions>(QueueType.email, {connection: fastify.redisBullMq});
        fastify.decorate('emailQueue', emailQueue);
        fastify.addHook('onClose', () => emailQueue.close());
    },
    {name: 'queue', dependencies: ['redis']}
);

export default queuePlugin;
