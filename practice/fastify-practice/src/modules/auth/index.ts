import {httpErrors} from '@fastify/sensible';
import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {AccountProvider, UserRank} from '@/database/prisma/enums';
import {RefreshCookieName, TokenTypes, UserRankValue, refreshCookieOptions} from './const';
import {hashPassword, startSession, verifyPassword} from './helper';
import {registerAuthJobs} from './jobs';
import OAuthService from './oauth/service';
import {
    changeUserPasswordSchema,
    changeUserRankSchema,
    getCurrentUserSchema,
    loginUserSchema,
    logoutUserSchema,
    refreshTokenSchema,
    registerUserSchema
} from './schemas';
import SessionsService from './sessions-service';
import UsersService from './users-service';

const auth: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const sessionsService = new SessionsService(fastify.prisma);
    const usersService = new UsersService(fastify.prisma);
    const oAuthService = new OAuthService(fastify.prisma);

    registerAuthJobs(fastify, sessionsService);

    fastify.post(
        '/register',
        {schema: registerUserSchema, config: {rateLimit: {max: 5}}},
        async (req, res): Promise<void> => {
            res.code(201).send({user: await usersService.createUser(req.body)});
        }
    );

    fastify.post(
        '/login',
        {schema: loginUserSchema, config: {rateLimit: {max: 5}}},
        async (req, res): Promise<void> => {
            const user = await usersService.verifyUser(req.body);
            res.send({token: await startSession(res, sessionsService, user)});
        }
    );

    fastify.get('/github/callback', async (req, res): Promise<void> => {
        const {token} = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
        const user = await oAuthService.login(AccountProvider.github, token);
        res.send({token: await startSession(res, sessionsService, user)});
    });

    fastify.get('/google/callback', async (req, res): Promise<void> => {
        const {token} = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
        const user = await oAuthService.login(AccountProvider.google, token);
        res.send({token: await startSession(res, sessionsService, user)});
    });

    fastify.post(
        '/refresh',
        {schema: refreshTokenSchema, config: {rateLimit: {max: 5}}},
        async (req, res): Promise<void> => {
            await req.jwtVerify({onlyCookie: true});
            const {id, tokenType, sessionId} = req.user;

            if (tokenType !== TokenTypes.refresh || !sessionId) throw httpErrors.unauthorized();

            const session = await sessionsService.getSessionById(sessionId);

            if (!session || session.expiresAt < new Date()) {
                !!session && (await sessionsService.deleteSession(sessionId));
                throw httpErrors.unauthorized();
            }

            const user = await usersService.getUserById(id);
            const accessToken = await res.jwtSign({sub: user.id, rank: user.rank, tokenType: TokenTypes.access});

            res.send({token: accessToken});
        }
    );

    fastify.post('/logout', {schema: logoutUserSchema}, async (req, res): Promise<void> => {
        try {
            await req.jwtVerify({onlyCookie: true});
            const sessionId = req.user.sessionId;
            !!sessionId && (await sessionsService.deleteSession(sessionId));
        } catch {
            fastify.log.info('Force logout');
        }

        res.clearCookie(RefreshCookieName, {path: refreshCookieOptions.path});
        res.send({message: 'Logout successfully'});
    });

    fastify.post('/logout-all', {schema: logoutUserSchema}, async (req, res): Promise<void> => {
        try {
            await req.jwtVerify({onlyCookie: true});
            const id = req.user.id;
            !!id && (await sessionsService.deleteAllSessions(id));
        } catch {
            fastify.log.info('Force logout');
        }

        res.clearCookie(RefreshCookieName, {path: refreshCookieOptions.path});
        res.send({message: 'Logout successfully'});
    });

    fastify.get(
        '/me',
        {schema: getCurrentUserSchema, onRequest: fastify.authGuard(UserRank.trooper)},
        async (req, res): Promise<void> => {
            res.send({user: await usersService.getCurrentUser(req.user.id)});
        }
    );

    fastify.patch(
        '/:id/rank',
        {schema: changeUserRankSchema, onRequest: fastify.authGuard(UserRank.captain)},
        async (req, res): Promise<void> => {
            const targetId = req.params.id;
            const targetUser = await usersService.getUserById(targetId);

            const targetRank = UserRankValue[targetUser.rank];
            const newRank = UserRankValue[req.body.rank];
            const callerRank = UserRankValue[req.user.rank];

            if (targetRank >= callerRank || callerRank < newRank) throw httpErrors.forbidden();

            res.send({user: await usersService.updateUser(targetId, req.body)});
        }
    );

    fastify.patch(
        '/change-password',
        {
            schema: changeUserPasswordSchema,
            config: {rateLimit: {max: 5}},
            onRequest: fastify.authGuard(UserRank.trooper)
        },
        async (req, res): Promise<void> => {
            const id = req.user.id;
            const user = await usersService.getUserById(id);
            const {password, newPassword} = req.body;

            if (!user.password) {
                await usersService.updateUser(id, {password: await hashPassword(newPassword)});
            } else {
                if (!password) throw httpErrors.badRequest('Current password is required');
                if (password === newPassword) throw httpErrors.badRequest('New password must be different');

                if (!(await verifyPassword(password, user.password))) throw httpErrors.badRequest('Wrong password');

                await usersService.updateUser(id, {password: await hashPassword(newPassword)});
                await sessionsService.deleteAllSessions(id);

                res.clearCookie(RefreshCookieName, {path: refreshCookieOptions.path});
            }

            res.send({message: 'Password updated successfully'});
        }
    );
};

export default auth;
