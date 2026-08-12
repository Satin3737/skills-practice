import fp from 'fastify-plugin';
import EmailService from '@/common/email/service';
import UsersService from '@/modules/auth/service';
import MissionFeed from '@/modules/missions/feed';
import MissionsService from '@/modules/missions/service';
import StormtroopersService from '@/modules/stormtroopers/service';
import WeaponsService from '@/modules/weapons/service';

const servicesPlugin = fp(
    async fastify => {
        fastify.decorate(
            'emailService',
            new EmailService(fastify.log, {
                host: fastify.config.SMTP_HOST,
                port: fastify.config.SMTP_PORT
            })
        );

        fastify.decorate('usersService', new UsersService(fastify.prisma, fastify.emailQueue));
        fastify.decorate('stormtroopersService', new StormtroopersService(fastify.prisma));
        fastify.decorate('missionsService', new MissionsService(fastify.prisma, fastify.emailQueue));
        fastify.decorate('weaponsService', new WeaponsService(fastify.prisma));
        fastify.decorate('missionFeed', new MissionFeed());
    },
    {name: 'services', dependencies: ['prisma', 'queue', 'env']}
);

export default servicesPlugin;
