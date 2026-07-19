import type {Token} from '@fastify/oauth2';
import type {FastifyInstance} from 'fastify';
import type {UserRank} from '@/database/prisma/enums';
import {TokenTypes} from '@/modules/auth/const';

export const signAccessToken = (app: FastifyInstance, rank: UserRank, userId = 1): string => {
    return app.jwt.sign({sub: userId, rank, tokenType: TokenTypes.access});
};

export const buildToken = (accessToken: string): Token => ({
    token_type: 'Bearer',
    access_token: accessToken,
    expires_in: 3600,
    expires_at: new Date()
});
