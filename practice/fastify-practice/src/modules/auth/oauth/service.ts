import type {Token} from '@fastify/oauth2';
import type {PrismaClient, User} from '@/database/prisma/client';
import {AccountProvider} from '@/database/prisma/enums';
import type BaseOAuthStrategy from './strategies/base';
import GithubStrategy from './strategies/github';
import GoogleStrategy from './strategies/google';
import type {IOAuthLoginData} from './types';

class OAuthService {
    private readonly db: PrismaClient;

    private readonly strategies: Record<AccountProvider, BaseOAuthStrategy> = {
        [AccountProvider.github]: new GithubStrategy(),
        [AccountProvider.google]: new GoogleStrategy()
    };

    public constructor(db: PrismaClient) {
        this.db = db;
    }

    public async login(provider: AccountProvider, params: Token): Promise<User> {
        const accountData = await this.strategies[provider].authenticate(params);
        return this.findOrCreateUser(provider, accountData);
    }

    private async findOrCreateUser(provider: AccountProvider, accountData: IOAuthLoginData): Promise<User> {
        const providerAccountId = String(accountData.id);
        const accountWhere = {provider_providerAccountId: {provider, providerAccountId}} as const;

        const account = await this.db.account.findUnique({where: accountWhere, include: {user: true}});
        if (account) return account.user;

        const existedUser = await this.db.user.findUnique({where: {email: accountData.email}});

        if (existedUser) {
            await this.db.account.create({data: {provider, providerAccountId, userId: existedUser.id}});
            return existedUser;
        }

        return this.db.user.create({
            data: {
                email: accountData.email,
                stormtrooper: {create: {callSign: accountData.name}},
                accounts: {create: {provider, providerAccountId}}
            }
        });
    }
}

export default OAuthService;
