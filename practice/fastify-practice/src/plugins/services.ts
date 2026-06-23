import fp from 'fastify-plugin';
import MissionsService from '@/modules/missions/service';
import WeaponService from '@/modules/weapons/service';

const servicesPlugin = fp(
    async fastify => {
        fastify.decorate('missionsService', new MissionsService(fastify.prisma));
        fastify.decorate('weaponsService', new WeaponService(fastify.prisma));
    },
    {dependencies: ['prisma']}
);

export default servicesPlugin;
