import {httpErrors} from '@fastify/sensible';
import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {UserType} from '@/database/prisma/enums';
import {IsProd, RefreshTokenAgeSec, TokenTypes, UserTypeRank} from './const';
import {
    changeUserRangSchema,
    getCurrentUserSchema,
    loginUserSchema,
    logoutUserSchema,
    refreshTokenSchema,
    registerUserSchema
} from './schemas';
import AuthService from './service';

const auth: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const authService = new AuthService(fastify.prisma);

    fastify.post('/register', {schema: registerUserSchema}, async (req, res): Promise<void> => {
        res.code(201).send({user: await authService.createUser(req.body)});
    });

    fastify.post('/login', {schema: loginUserSchema}, async (req, res): Promise<void> => {
        const user = await authService.verifyUser(req.body);
        const session = await authService.createSession(user.id);
        const payload = {sub: user.id, type: user.type};

        const accessToken = await res.jwtSign({
            ...payload,
            tokenType: TokenTypes.access
        });

        const refreshToken = await res.jwtSign(
            {...payload, tokenType: TokenTypes.refresh, sessionId: session.id},
            {expiresIn: RefreshTokenAgeSec}
        );

        res.setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: IsProd,
            sameSite: 'strict',
            path: '/auth',
            maxAge: RefreshTokenAgeSec
        });

        res.send({token: accessToken});
    });

    fastify.post('/refresh', {schema: refreshTokenSchema}, async (req, res): Promise<void> => {
        await req.jwtVerify({onlyCookie: true});
        const {id, tokenType, sessionId} = req.user;

        if (tokenType !== TokenTypes.refresh || !sessionId) throw httpErrors.unauthorized();

        const session = await authService.getSessionById(sessionId);

        if (!session || session.expiresAt < new Date()) {
            !!session && (await authService.deleteSession(sessionId));
            throw httpErrors.unauthorized();
        }

        const user = await authService.getUserById(id);
        const accessToken = await res.jwtSign({sub: user.id, type: user.type, tokenType: TokenTypes.access});

        res.send({token: accessToken});
    });

    fastify.post('/logout', {schema: logoutUserSchema}, async (req, res): Promise<void> => {
        try {
            await req.jwtVerify({onlyCookie: true});
            const sessionId = req.user.sessionId;
            !!sessionId && (await authService.deleteSession(sessionId));
        } catch {
            fastify.log.info('Force logout');
        }

        res.clearCookie('refreshToken', {path: '/auth'});
        res.send({message: 'Logout successfully'});
    });

    fastify.post('/logout-all', {schema: logoutUserSchema}, async (req, res): Promise<void> => {
        try {
            await req.jwtVerify({onlyCookie: true});
            const id = req.user.id;
            !!id && (await authService.deleteAllSessions(id));
        } catch {
            fastify.log.info('Force logout');
        }

        res.clearCookie('refreshToken', {path: '/auth'});
        res.send({message: 'Logout successfully'});
    });

    fastify.get(
        '/me',
        {schema: getCurrentUserSchema, onRequest: fastify.authGuard(UserType.trooper)},
        async (req, res): Promise<void> => {
            res.send({user: await authService.getCurrentUser(req.user.id)});
        }
    );

    fastify.post(
        '/:id/rang',
        {schema: changeUserRangSchema, onRequest: fastify.authGuard(UserType.captain)},
        async (req, res): Promise<void> => {
            const targetId = req.params.id;
            const targetUser = await authService.getUserById(targetId);

            const targetRank = UserTypeRank[targetUser.type];
            const newRank = UserTypeRank[req.body.type];
            const callerRank = UserTypeRank[req.user.type];

            if (targetRank >= callerRank || callerRank < newRank) throw httpErrors.forbidden();

            res.send({user: await authService.updateUser(targetId, req.body)});
        }
    );
};

export default auth;
