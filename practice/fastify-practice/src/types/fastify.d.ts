import type {onRequestAsyncHookHandler} from 'fastify';
import type {PrismaClient} from '@/database/prisma/client';
import type {UserType} from '@/database/prisma/enums';
import type {IJWTPayload} from '@/modules/auth/types';
import type MissionsService from '@/modules/missions/service';
import type StormtrooperService from '@/modules/stormtroopers/service';
import type WeaponService from '@/modules/weapons/service';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        stormtrooperService: StormtrooperService;
        missionsService: MissionsService;
        weaponsService: WeaponService;
        authGuard: (minRank: UserType) => onRequestAsyncHookHandler;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {sub: number} & IJWTPayload;
        user: {id: number} & IJWTPayload;
    }
}
