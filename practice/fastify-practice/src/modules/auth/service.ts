import {httpErrors} from '@fastify/sensible';
import type {Queue} from 'bullmq';
import EmailTemplates from '@/common/email/templates';
import type {IEmailOptions} from '@/common/email/types';
import type {PrismaClient, User} from '@/database/prisma/client';
import {hashPassword, verifyPassword} from './helper';
import type {ILoginUserData, IRegisterUserData, IUpdateUserData, IUserWithStormtrooper} from './types';

class UsersService {
    private readonly db: PrismaClient;
    private readonly emailQueue: Queue<IEmailOptions>;

    public constructor(db: PrismaClient, emailQueue: Queue<IEmailOptions>) {
        this.db = db;
        this.emailQueue = emailQueue;
    }

    public async createUser(data: IRegisterUserData): Promise<User> {
        const {email, password, callSign, rank} = data;
        const hash = await hashPassword(password);
        const user = this.db.user.create({data: {email, password: hash, rank, stormtrooper: {create: {callSign}}}});
        void this.emailQueue.add('welcome', {to: email, ...EmailTemplates.getWelcomeTemplate(callSign)});
        return user;
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

    public updateUser(id: number, data: IUpdateUserData): Promise<User> {
        return this.db.user.update({where: {id}, data});
    }
}

export default UsersService;
