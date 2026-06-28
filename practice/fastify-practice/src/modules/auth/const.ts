import {UserRank} from '@/database/prisma/enums';

export const AccessTokenAgeSec = 60 * 15;
export const RefreshTokenAgeSec = 60 * 60 * 24;

export const TokenTypes = {
    access: 'access',
    refresh: 'refresh'
} as const;

export const UserRankValue = {
    [UserRank.trooper]: 0,
    [UserRank.captain]: 1,
    [UserRank.admiral]: 2,
    [UserRank.emperor]: 3
} as const satisfies Record<UserRank, number>;
