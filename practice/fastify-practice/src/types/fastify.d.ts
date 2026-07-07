import type {OAuth2Namespace} from '@fastify/oauth2';
import type {onRequestAsyncHookHandler} from 'fastify';
import type Redis from 'ioredis';
import type {PrismaClient} from '@/database/prisma/client';
import type {UserRank} from '@/database/prisma/enums';
import type {IJWTPayload} from '@/modules/auth/types';
import type MissionFeed from '@/modules/missions/feed';
import type MissionsService from '@/modules/missions/service';
import type StormtrooperService from '@/modules/stormtroopers/service';
import type WeaponService from '@/modules/weapons/service';
import type {IEnvConfig} from '@/plugins/env';
import type {IRedisChannelPayloads} from '@/types/redis';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        stormtrooperService: StormtrooperService;
        missionsService: MissionsService;
        weaponsService: WeaponService;
        missionFeed: MissionFeed;
        authGuard: (minRank: UserRank) => onRequestAsyncHookHandler;
        config: IEnvConfig;
        githubOAuth2: OAuth2Namespace;
        googleOAuth2: OAuth2Namespace;
        redisFailFast: Redis;
        redisSub: Redis;
        pushRedisEvent: <C extends keyof IRedisChannelPayloads>(channel: C, message: IRedisChannelPayloads[C]) => void;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {sub: number} & IJWTPayload;
        user: {id: number} & IJWTPayload;
    }
}
