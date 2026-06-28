import {UserType} from '@/database/prisma/enums';

export const IsProd = process.env.NODE_ENV === 'production';

export const AccessTokenAgeSec = 60 * 15;
export const RefreshTokenAgeSec = 60 * 60 * 24;

export const TokenTypes = {
    access: 'access',
    refresh: 'refresh'
} as const;

export const UserTypeRank = {
    [UserType.trooper]: 0,
    [UserType.captain]: 1,
    [UserType.admiral]: 2,
    [UserType.emperor]: 3
} as const satisfies Record<UserType, number>;
