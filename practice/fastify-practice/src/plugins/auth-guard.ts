import {httpErrors} from '@fastify/sensible';
import type {onRequestAsyncHookHandler} from 'fastify';
import fp from 'fastify-plugin';
import {UserRank} from '@/database/prisma/enums';
import {TokenTypes, UserRankValue} from '@/modules/auth/const';

const authGuard = fp(async fastify => {
    fastify.decorate('authGuard', (minRank: UserRank): onRequestAsyncHookHandler => {
        return async (req): Promise<void> => {
            await req.jwtVerify();
            const user = req.user;
            if (user.tokenType !== TokenTypes.access) throw httpErrors.unauthorized('Invalid token');
            if ((UserRankValue[user.rank] ?? -1) < UserRankValue[minRank]) throw httpErrors.forbidden();
        };
    });
});

export default authGuard;
