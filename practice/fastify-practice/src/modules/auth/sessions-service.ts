import type {PrismaClient, Session} from '@/database/prisma/client';
import type {BatchPayload} from '@/database/prisma/internal/prismaNamespace';
import {RefreshTokenAgeSec} from './const';

class SessionsService {
    private readonly db: PrismaClient;

    public constructor(db: PrismaClient) {
        this.db = db;
    }

    public createSession(userId: number): Promise<Session> {
        return this.db.session.create({data: {userId, expiresAt: new Date(Date.now() + RefreshTokenAgeSec * 1000)}});
    }

    public getSessionById(id: string): Promise<Session | null> {
        return this.db.session.findUnique({where: {id}});
    }

    public deleteSession(id: string): Promise<BatchPayload> {
        return this.db.session.deleteMany({where: {id}});
    }

    public deleteAllSessions(userId: number): Promise<BatchPayload> {
        return this.db.session.deleteMany({where: {userId}});
    }

    public deleteExpiredSessions(): Promise<BatchPayload> {
        return this.db.session.deleteMany({where: {expiresAt: {lt: new Date()}}});
    }
}

export default SessionsService;
