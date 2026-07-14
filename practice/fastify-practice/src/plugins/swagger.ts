import swagger, {type FastifySwaggerOptions} from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

const swaggerPlugin = fp<FastifySwaggerOptions>(
    async fastify => {
        await fastify.register(swagger, {
            openapi: {
                info: {
                    title: 'Fastify Practice API',
                    description: 'API documentation for Fastify Practice',
                    version: '1.0.0'
                },
                tags: [
                    {name: 'Auth', description: 'Registration, login, sessions'},
                    {name: 'Missions', description: 'Combat missions'},
                    {name: 'Planets', description: 'Planets and their missions'},
                    {name: 'Stormtroopers', description: 'Stormtroopers and their weapons'},
                    {name: 'Weapons', description: 'Weapons arsenal'}
                ],
                security: [{bearerAuth: []}],
                components: {
                    securitySchemes: {
                        bearerAuth: {type: 'http', scheme: 'bearer', bearerFormat: 'JWT'}
                    }
                }
            }
        });

        fastify.addHook('onRoute', routeOptions => {
            const segment = routeOptions.prefix.replace(/^\//, '');
            if (!segment) return;
            routeOptions.schema ??= {};
            routeOptions.schema.tags ??= [segment[0].toUpperCase() + segment.slice(1)];
        });

        await fastify.register(swaggerUi, {routePrefix: '/docs'});
    },
    {name: 'swagger'}
);

export default swaggerPlugin;
