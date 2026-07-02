import type {Token} from '@fastify/oauth2';
import type {PrismaClient} from '@/database/prisma/client';
import type {AccountProvider} from '@/database/prisma/enums';
import type {IOAuthLoginData} from './types';

abstract class BaseOAuthStrategy {
    protected readonly db: PrismaClient;
    protected readonly provider: AccountProvider;

    public constructor(db: PrismaClient, provider: AccountProvider) {
        this.db = db;
        this.provider = provider;
    }

    public abstract authenticate(params: Token): Promise<IOAuthLoginData>;
}

export default BaseOAuthStrategy;
