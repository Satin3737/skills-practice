import jwt, {type FastifyJWTOptions} from '@fastify/jwt';
import fp from 'fastify-plugin';
import {AccessTokenAgeSec} from '@/modules/auth/const';

const jwtPlugin = fp<FastifyJWTOptions>(
    async fastify => {
        await fastify.register(jwt, {
            secret: fastify.config.JWT_SECRET,
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
                    rank: payload.rank,
                    tokenType: payload.tokenType,
                    sessionId: payload.sessionId
                };
            }
        });
    },
    {name: 'jwt', dependencies: ['env', 'cookie']}
);

export default jwtPlugin;
