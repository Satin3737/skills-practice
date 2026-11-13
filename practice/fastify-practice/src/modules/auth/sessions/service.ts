import type {PrismaClient, Session} from '@/database/prisma/client';
import type {BatchPayload} from '@/database/prisma/internal/prismaNamespace';
import {RefreshTokenAgeSec} from '../const';

class SessionsService {
    private readonly db: PrismaClient;

    public constructor(db: PrismaClient) {
        this.db = db;
    }

    public createSession(userId: number): Promise<Session> {
        return this.db.session.create({
            data: {userId, expiresAt: new Date(Date.now() + RefreshTokenAgeSec * 1000)}
        });
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

    public async rotateToken(id: string, tokenId: string): Promise<Session | null> {
        const {count} = await this.db.session.updateMany({
            where: {id, tokenId, expiresAt: {gt: new Date()}},
            data: {
                tokenId: crypto.randomUUID(),
                expiresAt: new Date(Date.now() + RefreshTokenAgeSec * 1000)
            }
        });

        if (!count) {
            await this.deleteSession(id);
            return null;
        }

        return this.db.session.findUniqueOrThrow({where: {id}});
    }
}

export default SessionsService;
