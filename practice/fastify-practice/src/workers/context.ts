import '@/common/load-env';
import type {Worker} from 'bullmq';
import Redis from 'ioredis';
import pino, {type Logger} from 'pino';
import EmailService from '@/common/email/service';
import {getLoggerConfig} from '@/common/logger';

class WorkersContext {
    public readonly redis: Redis;
    public readonly logger: Logger;
    public readonly emailService: EmailService;

    public constructor() {
        const redisUrl = process.env.REDIS_URL;
        const host = process.env.SMTP_HOST ?? 'localhost';
        const port = Number(process.env.SMTP_PORT ?? 1025);
        if (!redisUrl) throw new Error('Redis URL is required');

        this.redis = new Redis(redisUrl, {maxRetriesPerRequest: null});
        this.logger = pino(getLoggerConfig());
        this.emailService = new EmailService(this.logger, {host, port});
    }

    public listenShutdownProcessSignals(worker: Worker): void {
        process.on('SIGINT', async () => this.shutdownWorker(worker, 'SIGINT'));
        process.on('SIGTERM', async () => this.shutdownWorker(worker, 'SIGTERM'));
    }

    private async shutdownWorker(worker: Worker, signal: string): Promise<void> {
        this.logger.info(`Shutting down worker due to ${signal}...`);

        try {
            await worker.close();
            process.exit(0);
        } catch (err) {
            this.logger.error(err, 'Error while shutting down worker');
            process.exit(1);
        }
    }
}

export const workersContext = new WorkersContext();
