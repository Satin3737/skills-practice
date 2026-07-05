import type {Static} from '@fastify/type-provider-typebox';
import type {IValuesOf} from '@/common/types';
import type {Session} from '@/database/prisma/client';
import type {UserRank} from '@/database/prisma/enums';
import type {UserGetPayload} from '@/database/prisma/models/User';
import {loginUserSchema, registerUserSchema, updateUserSchema} from '@/modules/auth/schemas';
import type {TokenTypes} from './const';

export type IRegisterUserData = Static<typeof registerUserSchema.body>;

export type IUpdateUserData = Static<typeof updateUserSchema.body>;

export type ILoginUserData = Static<typeof loginUserSchema.body>;

export type ITokenTypes = IValuesOf<typeof TokenTypes>;

export interface IJWTPayload {
    rank: UserRank;
    tokenType: ITokenTypes;
    sessionId?: string;
}

export type IUserWithStormtrooper = UserGetPayload<{include: {stormtrooper: true}}>;

export type IRedisSession = Omit<Session, 'expiresAt' | 'createdAt'> & {
    expiresAt: string;
    createdAt: string;
};
