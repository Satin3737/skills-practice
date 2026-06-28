import jwt, {type FastifyJWTOptions} from '@fastify/jwt';
import fp from 'fastify-plugin';
import {AccessTokenAgeSec} from '@/modules/auth/const';

const jwtPlugin = fp<FastifyJWTOptions>(async fastify => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');

    await fastify.register(jwt, {
        secret,
        cookie: {
            cookieName: 'refreshToken',
            signed: false
        },
        sign: {
            expiresIn: AccessTokenAgeSec
        },
        formatUser: payload => {
            return {
                id: payload.sub,
                type: payload.type,
                tokenType: payload.tokenType,
                sessionId: payload.sessionId
            };
        }
    });
});

export default jwtPlugin;
