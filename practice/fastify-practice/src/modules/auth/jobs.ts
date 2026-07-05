import type {FastifyInstance} from 'fastify';
import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';
import type SessionsService from './sessions-service';

export const registerAuthJobs = (fastify: FastifyInstance, sessionsService: SessionsService): void => {
    const task = new AsyncTask(
        'purge expired sessions',
        () => sessionsService.deleteExpiredSessions(),
        err => fastify.log.error(err, 'sessions purge failed')
    );

    fastify.scheduler.addSimpleIntervalJob(new SimpleIntervalJob({hours: 1}, task));
};
