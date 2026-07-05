import type {PrismaClient, Session} from '@/database/prisma/client';
import type {BatchPayload} from '@/database/prisma/internal/prismaNamespace';
import {RefreshTokenAgeSec} from '../const';
import type SessionsRedisService from './redis';

class SessionsService {
    private readonly db: PrismaClient;
    private readonly redis: SessionsRedisService;

    public constructor(db: PrismaClient, redis: SessionsRedisService) {
        this.db = db;
        this.redis = redis;
    }

    public async createSession(userId: number): Promise<Session> {
        const session = await this.db.session.create({
            data: {userId, expiresAt: new Date(Date.now() + RefreshTokenAgeSec * 1000)}
        });

        await this.redis.setSession(session, RefreshTokenAgeSec);
        return session;
    }

    public async getSessionById(id: string): Promise<Session | null> {
        const cached = await this.redis.getSession(id);
        if (cached) return cached;

        const session = await this.db.session.findUnique({where: {id}});
        if (!session || session.expiresAt < new Date()) return null;

        const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
        if (ttl > 0) await this.redis.setSession(session, ttl);

        return session;
    }

    public async deleteSession(id: string): Promise<BatchPayload> {
        const result = await this.db.session.deleteMany({where: {id}});
        await this.redis.deleteSession(id);
        return result;
    }

    public async deleteAllSessions(userId: number): Promise<BatchPayload> {
        const ids = await this.db.session.findMany({where: {userId}, select: {id: true}});
        const result = await this.db.session.deleteMany({where: {userId}});
        if (ids.length) await this.redis.deleteSession(ids.map(s => s.id));
        return result;
    }

    public deleteExpiredSessions(): Promise<BatchPayload> {
        return this.db.session.deleteMany({where: {expiresAt: {lt: new Date()}}});
    }
}

export default SessionsService;
