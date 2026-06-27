import {httpErrors} from '@fastify/sensible';
import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {IsProd, RefreshTokenAgeSec} from './const';
import {loginUserSchema, logoutUserSchema, refreshTokenSchema, registerUserSchema} from './schemas';
import UserService from './service';
import {TokenTypes} from './types';

const auth: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const userService = new UserService(fastify.prisma);

    fastify.post('/register', {schema: registerUserSchema}, async (req, res): Promise<void> => {
        res.code(201).send({user: await userService.createUser(req.body)});
    });

    fastify.post('/login', {schema: loginUserSchema}, async (req, res): Promise<void> => {
        const user = await userService.verifyUser(req.body);
        const session = await userService.createSession(user.id);
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

        res.send({token: accessToken, user});
    });

    fastify.post('/refresh', {schema: refreshTokenSchema}, async (req, res): Promise<void> => {
        await req.jwtVerify({onlyCookie: true});
        const {id, tokenType, sessionId} = req.user;

        if (tokenType !== TokenTypes.refresh || !sessionId) throw httpErrors.unauthorized();

        const session = await userService.getSessionById(sessionId);

        if (!session || session.expiresAt < new Date()) {
            !!session && (await userService.deleteSession(sessionId));
            throw httpErrors.unauthorized();
        }

        const user = await userService.getUserById(id);
        const accessToken = await res.jwtSign({sub: user.id, type: user.type, tokenType: TokenTypes.access});

        res.send({token: accessToken});
    });

    fastify.post('/logout', {schema: logoutUserSchema}, async (req, res): Promise<void> => {
        try {
            await req.jwtVerify({onlyCookie: true});
            const sessionId = req.user.sessionId;
            !!sessionId && (await userService.deleteSession(sessionId));
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
            !!id && (await userService.deleteAllSessions(id));
        } catch {
            fastify.log.info('Force logout');
        }

        res.clearCookie('refreshToken', {path: '/auth'});
        res.send({message: 'Logout successfully'});
    });
};

export default auth;
