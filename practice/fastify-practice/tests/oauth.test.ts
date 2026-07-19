import type {FastifyInstance} from 'fastify';
import {afterAll, afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {AccountProvider} from '@/database/prisma/enums';
import {registerUser} from './helpers/auth';
import {buildTestApp} from './helpers/build-app';
import {mockFetchResponses, mockOAuthToken} from './helpers/oauth';

describe('oauth', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterEach(async () => {
        await app.prisma.user.deleteMany();
        await app.prisma.stormtrooper.deleteMany();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /auth/github/callback', () => {
        it('creates a new user from a fresh github account', async () => {
            mockOAuthToken(app.githubOAuth2, 'gh-token');
            mockFetchResponses({'/user': {id: 1, login: 'lukesky', name: 'Luke Skywalker', email: 'luke@rebels.com'}});

            const res = await app.inject({method: 'GET', url: '/auth/github/callback'});

            expect(res.statusCode).toBe(200);
            expect(res.json().token).toEqual(expect.any(String));

            const account = await app.prisma.account.findFirst({
                where: {provider: AccountProvider.github, providerAccountId: '1'}
            });
            expect(account).toBeTruthy();
        });

        it('falls back to the primary verified email when /user has none', async () => {
            mockOAuthToken(app.githubOAuth2, 'gh-token');
            mockFetchResponses({
                '/user': {id: 2, login: 'lukesky2', email: null},
                '/user/emails': [
                    {email: 'secondary@rebels.com', primary: false, verified: true},
                    {email: 'primary@rebels.com', primary: true, verified: true}
                ]
            });

            const res = await app.inject({method: 'GET', url: '/auth/github/callback'});

            expect(res.statusCode).toBe(200);
            const user = await app.prisma.user.findUnique({where: {email: 'primary@rebels.com'}});
            expect(user).toBeTruthy();
        });

        it('rejects when no verified email is available', async () => {
            mockOAuthToken(app.githubOAuth2, 'gh-token');
            mockFetchResponses({'/user': {id: 3, login: 'ghost', email: null}, '/user/emails': []});

            const res = await app.inject({method: 'GET', url: '/auth/github/callback'});

            expect(res.statusCode).toBe(401);
        });

        it('links to an existing account instead of creating a duplicate', async () => {
            mockOAuthToken(app.githubOAuth2, 'gh-token');
            mockFetchResponses({'/user': {id: 4, login: 'han', name: 'Han Solo', email: 'han@smugglers.com'}});

            const first = await app.inject({method: 'GET', url: '/auth/github/callback'});
            const second = await app.inject({method: 'GET', url: '/auth/github/callback'});

            expect(first.statusCode).toBe(200);
            expect(second.statusCode).toBe(200);

            const users = await app.prisma.user.findMany({where: {email: 'han@smugglers.com'}});
            expect(users).toHaveLength(1);
        });

        it('links a github account to an existing user with the same email', async () => {
            const {res: registerRes} = await registerUser(app, {email: 'leia@rebels.com'});
            const userId = registerRes.json().user.id;

            mockOAuthToken(app.githubOAuth2, 'gh-token');
            mockFetchResponses({'/user': {id: 5, login: 'leia', name: 'Leia Organa', email: 'leia@rebels.com'}});

            const res = await app.inject({method: 'GET', url: '/auth/github/callback'});

            expect(res.statusCode).toBe(200);
            const users = await app.prisma.user.findMany({where: {email: 'leia@rebels.com'}});
            expect(users).toHaveLength(1);
            expect(users[0].id).toBe(userId);
        });
    });

    describe('GET /auth/google/callback', () => {
        it('creates a new user from a verified google account', async () => {
            mockOAuthToken(app.googleOAuth2, 'gg-token');
            mockFetchResponses({
                '/userinfo': {sub: 'g-1', name: 'Mon Mothma', email: 'mon@rebels.com', email_verified: true}
            });

            const res = await app.inject({method: 'GET', url: '/auth/google/callback'});

            expect(res.statusCode).toBe(200);
            expect(res.json().token).toEqual(expect.any(String));
        });

        it('rejects an unverified email', async () => {
            mockOAuthToken(app.googleOAuth2, 'gg-token');
            mockFetchResponses({'/userinfo': {sub: 'g-2', email: 'unverified@rebels.com', email_verified: false}});

            const res = await app.inject({method: 'GET', url: '/auth/google/callback'});

            expect(res.statusCode).toBe(401);
        });
    });
});
