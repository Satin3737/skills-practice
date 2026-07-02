import type {FastifyInstance} from 'fastify';
import {AsyncTask, SimpleIntervalJob} from 'toad-scheduler';
import type AuthService from './service';

export const registerAuthJobs = (fastify: FastifyInstance, authService: AuthService): void => {
    const task = new AsyncTask(
        'purge expired sessions',
        () => authService.deleteExpiredSessions(),
        err => fastify.log.error(err, 'sessions purge failed')
    );

    fastify.scheduler.addSimpleIntervalJob(new SimpleIntervalJob({hours: 1}, task));
};
