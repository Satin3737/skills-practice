import {httpErrors} from '@fastify/sensible';
import type {PrismaClient, Session, User} from '@/database/prisma/client';
import type {BatchPayload} from '@/database/prisma/internal/prismaNamespace';
import {RefreshTokenAgeSec} from './const';
import {hashPassword, verifyPassword} from './helper';
import type {ILoginUserData, IRegisterUserData, IUserWithStormtrooper} from './types';

class AuthService {
    private readonly db: PrismaClient;

    public constructor(db: PrismaClient) {
        this.db = db;
    }

    public async createUser(data: IRegisterUserData): Promise<User> {
        const {email, password, callSign, type} = data;
        const hash = await hashPassword(password);
        return this.db.user.create({data: {email, password: hash, type, stormtrooper: {create: {callSign}}}});
    }

    public async verifyUser(data: ILoginUserData): Promise<User> {
        const {email, password} = data;
        const user = await this.db.user.findUnique({where: {email}});

        if (!user || !(await verifyPassword(password, user.password))) {
            throw httpErrors.unauthorized('Invalid email or password');
        }

        return user;
    }

    public async getCurrentUser(id: number): Promise<IUserWithStormtrooper> {
        return this.db.user.findUniqueOrThrow({where: {id}, include: {stormtrooper: true}});
    }

    public getUserById(id: number): Promise<User> {
        return this.db.user.findUniqueOrThrow({where: {id}});
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
}

export default AuthService;
