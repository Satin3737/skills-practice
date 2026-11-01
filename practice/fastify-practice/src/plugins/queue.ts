import {Queue} from 'bullmq';
import fp from 'fastify-plugin';
import {QueueType} from '@/common/const';
import type {IEmailOptions} from '@/common/email/types';

const queuePlugin = fp(
    async fastify => {
        const emailQueue = new Queue<IEmailOptions>(QueueType.email, {
            connection: fastify.redisBullMq,
            defaultJobOptions: {
                attempts: 3,
                backoff: {type: 'exponential', delay: 5000},
                removeOnComplete: true,
                removeOnFail: 1000
            }
        });

        fastify.decorate('emailQueue', emailQueue);
        fastify.addHook('onClose', () => emailQueue.close());
    },
    {name: 'queue', dependencies: ['redis']}
);

export default queuePlugin;
