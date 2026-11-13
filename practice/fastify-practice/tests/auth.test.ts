import type {FastifyInstance, LightMyRequestResponse} from 'fastify';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {UserRank} from '@/database/prisma/enums';
import {getRefreshCookie, loginUser, registerUser} from './helpers/auth';
import {buildTestApp} from './helpers/build-app';
import {signAccessToken} from './helpers/jwt';

describe('auth', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    beforeEach(() => {
        vi.spyOn(app.emailQueue, 'add').mockImplementation(vi.fn());
    });

    afterEach(async () => {
        await app.prisma.user.deleteMany();
        await app.prisma.stormtrooper.deleteMany();
        await app.redisFailFast.flushdb();
        vi.restoreAllMocks();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /auth/register', () => {
        it('creates a user with default trooper rank and hides the password', async () => {
            const {res} = await registerUser(app, {email: 'luke@rebels.com', callSign: 'Red-5'});

            expect(res.statusCode).toBe(201);
            const {user} = res.json();
            expect(user).toMatchObject({email: 'luke@rebels.com', rank: UserRank.trooper});
            expect(user.password).toBeUndefined();
            expect(app.emailQueue.add).toHaveBeenCalledWith(
                'welcome',
                expect.objectContaining({to: 'luke@rebels.com'})
            );
        });

        it('rejects a self-assigned rank', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/auth/register',
                payload: {email: 'vader@empire.com', password: 'password123', callSign: 'Vader', rank: UserRank.emperor}
            });

            expect(res.statusCode).toBe(400);
            expect(await app.prisma.user.count()).toBe(0);
        });

        it('rejects duplicate email', async () => {
            await registerUser(app, {email: 'dup@rebels.com'});
            const {res} = await registerUser(app, {email: 'dup@rebels.com'});

            expect(res.statusCode).toBe(409);
            expect(res.json().message).toBe('Duplicate value for User');
            expect(app.emailQueue.add).toHaveBeenCalledTimes(1);
        });

        it('escapes the call sign in the welcome email html', async () => {
            await registerUser(app, {callSign: '<a href="x">Win</a>'});

            const [, email] = vi.mocked(app.emailQueue.add).mock.calls[0];
            expect(email.html).toContain('&#60;a href=&#34;x&#34;&#62;Win&#60;/a&#62;');
            expect(email.html).not.toContain('<a');
        });

        it('rejects invalid email format', async () => {
            const {res} = await registerUser(app, {email: 'not-an-email'});

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /auth/login', () => {
        it('logs in with correct credentials and sets a refresh cookie', async () => {
            const {email, password} = await registerUser(app);
            const res = await loginUser(app, email, password);

            expect(res.statusCode).toBe(200);
            expect(res.json().token).toEqual(expect.any(String));
            expect(() => getRefreshCookie(res)).not.toThrow();
        });

        it('rejects a wrong password', async () => {
            const {email} = await registerUser(app);
            const res = await loginUser(app, email, 'wrong-password');

            expect(res.statusCode).toBe(401);
        });

        it('rejects an unknown email', async () => {
            const res = await loginUser(app, 'ghost@rebels.com', 'password123');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /auth/me', () => {
        it('rejects without a token', async () => {
            const res = await app.inject({method: 'GET', url: '/auth/me'});

            expect(res.statusCode).toBe(401);
        });

        it('returns the current user with their stormtrooper', async () => {
            const {res: registerRes} = await registerUser(app, {email: 'han@smugglers.com', callSign: 'Falcon'});
            const userId = registerRes.json().user.id;
            const token = signAccessToken(app, UserRank.trooper, userId);

            const res = await app.inject({method: 'GET', url: '/auth/me', headers: {authorization: `Bearer ${token}`}});

            expect(res.statusCode).toBe(200);
            const {user} = res.json();
            expect(user).toMatchObject({email: 'han@smugglers.com'});
            expect(user.stormtrooper).toMatchObject({callSign: 'Falcon'});
        });
    });

    describe('POST /auth/refresh', () => {
        it('rejects without a refresh cookie', async () => {
            const res = await app.inject({method: 'POST', url: '/auth/refresh'});

            expect(res.statusCode).toBe(401);
        });

        it('issues a new access token from a valid refresh cookie', async () => {
            const {email, password} = await registerUser(app);
            const loginRes = await loginUser(app, email, password);
            const refreshToken = getRefreshCookie(loginRes);

            const res = await app.inject({
                method: 'POST',
                url: '/auth/refresh',
                cookies: {refreshToken}
            });

            expect(res.statusCode).toBe(200);
            expect(res.json().token).toEqual(expect.any(String));
        });

        const refresh = (refreshToken: string): Promise<LightMyRequestResponse> => {
            return app.inject({method: 'POST', url: '/auth/refresh', cookies: {refreshToken}});
        };

        const loginAndGetCookie = async (): Promise<string> => {
            const {email, password} = await registerUser(app);
            return getRefreshCookie(await loginUser(app, email, password));
        };

        it('rotates the refresh cookie on every refresh', async () => {
            const first = await loginAndGetCookie();

            const res1 = await refresh(first);
            expect(res1.statusCode).toBe(200);
            const second = getRefreshCookie(res1);
            expect(second).not.toBe(first);

            const res2 = await refresh(second);
            expect(res2.statusCode).toBe(200);
            expect(getRefreshCookie(res2)).not.toBe(second);
        });

        it('revokes the whole session when a rotated token is reused', async () => {
            const stolen = await loginAndGetCookie();
            const current = getRefreshCookie(await refresh(stolen));

            const reuseRes = await refresh(stolen);
            expect(reuseRes.statusCode).toBe(401);
            expect(getRefreshCookie(reuseRes)).toBe('');

            expect((await refresh(current)).statusCode).toBe(401);
            expect(await app.prisma.session.count()).toBe(0);
        });

        it('lets only one of two concurrent refreshes with the same token succeed', async () => {
            const cookie = await loginAndGetCookie();

            const results = await Promise.all([refresh(cookie), refresh(cookie)]);

            expect(results.map(r => r.statusCode).sort()).toEqual([200, 401]);
        });
    });

    describe('POST /auth/logout', () => {
        it('clears the refresh cookie even without a valid session', async () => {
            const res = await app.inject({method: 'POST', url: '/auth/logout'});

            expect(res.statusCode).toBe(200);
            const cookie = res.cookies.find(c => c.name === 'refreshToken');
            expect(cookie?.value).toBe('');
        });

        it('invalidates the refresh token so it can no longer be used', async () => {
            const {email, password} = await registerUser(app);
            const loginRes = await loginUser(app, email, password);
            const refreshToken = getRefreshCookie(loginRes);

            const logoutRes = await app.inject({method: 'POST', url: '/auth/logout', cookies: {refreshToken}});
            expect(logoutRes.statusCode).toBe(200);

            const refreshRes = await app.inject({method: 'POST', url: '/auth/refresh', cookies: {refreshToken}});
            expect(refreshRes.statusCode).toBe(401);
        });
    });

    describe('PATCH /auth/:id/rank', () => {
        it('lets a higher rank promote a lower rank within their authority', async () => {
            const {res: targetRes} = await registerUser(app, {email: 'target@rebels.com'});
            const targetId = targetRes.json().user.id;
            const callerToken = signAccessToken(app, UserRank.admiral, 999);

            const res = await app.inject({
                method: 'PATCH',
                url: `/auth/${targetId}/rank`,
                headers: {authorization: `Bearer ${callerToken}`},
                payload: {rank: UserRank.captain}
            });

            expect(res.statusCode).toBe(200);
            expect(res.json().user.rank).toBe(UserRank.captain);
        });

        it('forbids granting a rank higher than the caller holds', async () => {
            const {res: targetRes} = await registerUser(app, {email: 'target2@rebels.com'});
            const targetId = targetRes.json().user.id;
            const callerToken = signAccessToken(app, UserRank.admiral, 999);

            const res = await app.inject({
                method: 'PATCH',
                url: `/auth/${targetId}/rank`,
                headers: {authorization: `Bearer ${callerToken}`},
                payload: {rank: UserRank.emperor}
            });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PATCH /auth/change-password', () => {
        it('rejects a wrong current password', async () => {
            const {res: registerRes, password} = await registerUser(app, {email: 'pw@rebels.com'});
            const userId = registerRes.json().user.id;
            const token = signAccessToken(app, UserRank.trooper, userId);

            const res = await app.inject({
                method: 'PATCH',
                url: '/auth/change-password',
                headers: {authorization: `Bearer ${token}`},
                payload: {password: `wrong-${password}`, newPassword: 'new-password123'}
            });

            expect(res.statusCode).toBe(400);
        });

        it('changes the password and clears existing sessions', async () => {
            const {res: registerRes, email, password} = await registerUser(app, {email: 'pw2@rebels.com'});
            const userId = registerRes.json().user.id;
            const token = signAccessToken(app, UserRank.trooper, userId);

            const loginRes = await loginUser(app, email, password);
            const refreshToken = getRefreshCookie(loginRes);

            const res = await app.inject({
                method: 'PATCH',
                url: '/auth/change-password',
                headers: {authorization: `Bearer ${token}`},
                payload: {password, newPassword: 'new-password123'}
            });

            expect(res.statusCode).toBe(200);

            const refreshRes = await app.inject({method: 'POST', url: '/auth/refresh', cookies: {refreshToken}});
            expect(refreshRes.statusCode).toBe(401);
        });
    });
});
