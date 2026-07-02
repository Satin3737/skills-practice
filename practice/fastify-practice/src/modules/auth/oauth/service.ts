import type {Token} from '@fastify/oauth2';
import type {PrismaClient, User} from '@/database/prisma/client';
import {AccountProvider} from '@/database/prisma/enums';
import type BaseOAuthStrategy from './base-oauth-strategy';
import GithubStrategy from './github-strategy';
import GoogleStrategy from './google-strategy';
import type {IOAuthLoginData} from './types';

class OAuthService {
    private readonly db: PrismaClient;
    private readonly githubStrategy: GithubStrategy;
    private readonly googleStrategy: GoogleStrategy;

    public constructor(db: PrismaClient) {
        this.db = db;
        this.githubStrategy = new GithubStrategy(this.db, AccountProvider.github);
        this.googleStrategy = new GoogleStrategy(this.db, AccountProvider.google);
    }

    public async login(provider: AccountProvider, params: Token): Promise<User> {
        const strategy = this.getStrategyFor(provider);
        const accountData = await strategy.authenticate(params);
        return this.findOrCreateUser(provider, accountData);
    }

    private getStrategyFor(provider: AccountProvider): BaseOAuthStrategy {
        switch (provider) {
            case AccountProvider.github:
                return this.githubStrategy;
            case AccountProvider.google:
                return this.googleStrategy;
        }
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
