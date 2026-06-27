import type {Static} from '@fastify/type-provider-typebox';
import type {UserType} from '@/database/prisma/enums';
import {loginUserSchema, registerUserSchema} from '@/modules/auth/schemas';

export type IRegisterUserData = Static<typeof registerUserSchema.body>;

export type ILoginUserData = Static<typeof loginUserSchema.body>;

export const TokenTypes = {
    access: 'access',
    refresh: 'refresh'
} as const;

export type TokenTypes = (typeof TokenTypes)[keyof typeof TokenTypes];

export interface JWTPayload {
    type: UserType;
    tokenType: TokenTypes;
    sessionId?: string;
}
