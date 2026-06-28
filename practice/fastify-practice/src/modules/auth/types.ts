import type {Static} from '@fastify/type-provider-typebox';
import type {IValuesOf} from '@/common/types';
import type {UserType} from '@/database/prisma/enums';
import type {UserGetPayload} from '@/database/prisma/models/User';
import {loginUserSchema, registerUserSchema} from '@/modules/auth/schemas';
import {type TokenTypes, UserTypeRank} from './const';

export type IRegisterUserData = Static<typeof registerUserSchema.body>;

export type ILoginUserData = Static<typeof loginUserSchema.body>;

export type ITokenTypes = IValuesOf<typeof TokenTypes>;

export type IUserTypeRank = IValuesOf<typeof UserTypeRank>;

export interface IJWTPayload {
    type: UserType;
    tokenType: ITokenTypes;
    sessionId?: string;
}

export type IUserWithStormtrooper = UserGetPayload<{include: {stormtrooper: true}}>;
