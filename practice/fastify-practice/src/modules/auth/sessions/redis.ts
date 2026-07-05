import type {FastifyBaseLogger} from 'fastify';
import type Redis from 'ioredis';
import type {Session} from '@/database/prisma/client';
import type {IRedisSession} from '../types';

class SessionsRedisService {
    private readonly redis: Redis;
    private readonly logger: FastifyBaseLogger;

    public constructor(redis: Redis, logger: FastifyBaseLogger) {
        this.redis = redis;
        this.logger = logger;
    }

    public async setSession(session: Session, ttl: number): Promise<void> {
        try {
            await this.redis.set(`session:${session.id}`, JSON.stringify(session), 'EX', ttl);
        } catch (err) {
            this.logger.error({err}, `Error caching session in Redis for ID ${session.id}`);
        }
    }

    public async getSession(id: string): Promise<Session | null> {
        try {
            const cached = await this.redis.get(`session:${id}`);
            if (cached) {
                const parsedCache = JSON.parse(cached) as IRedisSession;

                return {
                    ...parsedCache,
                    expiresAt: new Date(parsedCache.expiresAt),
                    createdAt: new Date(parsedCache.createdAt)
                };
            }
        } catch (err) {
            this.logger.error({err}, `Error retrieving session from Redis for ID ${id}`);
        }

        return null;
    }

    public async deleteSession(id: string | string[]): Promise<void> {
        try {
            if (Array.isArray(id)) {
                await this.redis.del(...id.map(i => `session:${i}`));
            } else {
                await this.redis.del(`session:${id}`);
            }
        } catch (err) {
            this.logger.error({err}, `Error deleting session from Redis for ID ${id}`);
        }
    }
}

export default SessionsRedisService;
