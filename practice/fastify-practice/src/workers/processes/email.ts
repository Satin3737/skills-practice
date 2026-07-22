import {Worker} from 'bullmq';
import {QueueType} from '@/common/const';
import type {IEmailOptions} from '@/common/email/types';
import {workersContext} from '../context';

const {emailService, logger, redis: connection} = workersContext;

const worker = new Worker<IEmailOptions>(
    QueueType.email,
    async job => {
        await emailService.sendMail(job.data);
    },
    {connection}
);

worker.on('failed', (_, err) => {
    logger.error(err, 'Failed to send email');
});
