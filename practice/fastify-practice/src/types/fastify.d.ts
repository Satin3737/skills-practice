import type {PrismaClient} from '@/database/prisma/client';
import type MissionsService from '@/modules/missions/service';
import type WeaponService from '@/modules/weapons/service';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
        missionsService: MissionsService;
        weaponsService: WeaponService;
    }
}
