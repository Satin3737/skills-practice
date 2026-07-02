import oauth2, {type FastifyOAuth2Options} from '@fastify/oauth2';
import fp from 'fastify-plugin';

const oauth2Plugin = fp<FastifyOAuth2Options>(
    async fastify => {
        await fastify.register(oauth2, {
            name: 'githubOAuth2',
            startRedirectPath: '/auth/github',
            credentials: {
                client: {
                    id: fastify.config.GITHUB_CLIENT_ID,
                    secret: fastify.config.GITHUB_CLIENT_SECRET
                },
                auth: oauth2.GITHUB_CONFIGURATION
            },
            callbackUri: 'http://localhost:3000/auth/github/callback',
            scope: ['read:user', 'user:email']
        });

        await fastify.register(oauth2, {
            name: 'googleOAuth2',
            startRedirectPath: '/auth/google',
            credentials: {
                client: {
                    id: fastify.config.GOOGLE_CLIENT_ID,
                    secret: fastify.config.GOOGLE_CLIENT_SECRET
                },
                auth: oauth2.GOOGLE_CONFIGURATION
            },
            callbackUri: 'http://localhost:3000/auth/google/callback',
            scope: ['openid', 'profile', 'email']
        });
    },
    {name: 'oauth2', dependencies: ['env']}
);

export default oauth2Plugin;
