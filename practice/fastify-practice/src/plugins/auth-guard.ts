import {httpErrors} from '@fastify/sensible';
import type {onRequestAsyncHookHandler} from 'fastify';
import fp from 'fastify-plugin';
import {UserType} from '@/database/prisma/enums';
import {TokenTypes, UserTypeRank} from '@/modules/auth/const';

const authGuard = fp(async fastify => {
    fastify.decorate('authGuard', (minRank: UserType = UserType.trooper): onRequestAsyncHookHandler => {
        return async (req): Promise<void> => {
            await req.jwtVerify();
            const user = req.user;
            if (user.tokenType !== TokenTypes.access) throw httpErrors.unauthorized('Invalid token');
            if ((UserTypeRank[user.type] ?? -1) < UserTypeRank[minRank]) throw httpErrors.forbidden();
        };
    });
});

export default authGuard;
