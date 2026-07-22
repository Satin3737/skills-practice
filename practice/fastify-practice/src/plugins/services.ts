import fp from 'fastify-plugin';
import EmailService from '@/common/email/service';
import MissionFeed from '@/modules/missions/feed';
import MissionsService from '@/modules/missions/service';
import StormtrooperService from '@/modules/stormtroopers/service';
import WeaponService from '@/modules/weapons/service';

const servicesPlugin = fp(
    async fastify => {
        fastify.decorate(
            'emailService',
            new EmailService(fastify.log, {
                host: fastify.config.SMTP_HOST,
                port: fastify.config.SMTP_PORT
            })
        );

        fastify.decorate('stormtrooperService', new StormtrooperService(fastify.prisma));
        fastify.decorate('missionsService', new MissionsService(fastify.prisma, fastify.emailQueue));
        fastify.decorate('weaponsService', new WeaponService(fastify.prisma));
        fastify.decorate('missionFeed', new MissionFeed());
    },
    {name: 'services', dependencies: ['prisma', 'env']}
);

export default servicesPlugin;
