import type {PrismaClient} from '@/database/prisma/client';
import type {JWTPayload} from '@/modules/auth/types';
import type MissionsService from '@/modules/missions/service';
import type StormtrooperService from '@/modules/stormtroopers/service';
import type WeaponService from '@/modules/weapons/service';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        stormtrooperService: StormtrooperService;
        missionsService: MissionsService;
        weaponsService: WeaponService;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {sub: number} & JWTPayload;
        user: {id: number} & JWTPayload;
    }
}
