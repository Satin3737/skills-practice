import fp from 'fastify-plugin';
import MissionsService from '@/modules/missions/service';
import StormtrooperService from '@/modules/stormtroopers/service';
import WeaponService from '@/modules/weapons/service';

const servicesPlugin = fp(
    async fastify => {
        fastify.decorate('stormtrooperService', new StormtrooperService(fastify.prisma));
        fastify.decorate('missionsService', new MissionsService(fastify.prisma));
        fastify.decorate('weaponsService', new WeaponService(fastify.prisma));
    },
    {name: 'services', dependencies: ['prisma']}
);

export default servicesPlugin;
