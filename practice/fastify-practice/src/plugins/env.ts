import env, {type FastifyEnvOptions} from '@fastify/env';
import {type Static, Type} from '@fastify/type-provider-typebox';
import fp from 'fastify-plugin';

export const Environment = {
    development: 'development',
    production: 'production',
    test: 'test'
} as const;

const schema = Type.Object({
    PORT: Type.Number({default: 3000}),
    NODE_ENV: Type.Enum(Environment, {default: Environment.development}),
    CORS_ORIGIN: Type.String(),
    DATABASE_URL: Type.String(),
    JWT_SECRET: Type.String(),
    JWT_EXPIRES_IN: Type.Number(),
    GITHUB_CLIENT_ID: Type.String(),
    GITHUB_CLIENT_SECRET: Type.String(),
    GOOGLE_CLIENT_ID: Type.String(),
    GOOGLE_CLIENT_SECRET: Type.String()
});

export type IEnvironment = (typeof Environment)[keyof typeof Environment];
export type IEnvConfig = Static<typeof schema>;

const envPlugin = fp<FastifyEnvOptions>(
    async fastify => {
        await fastify.register(env, {dotenv: true, schema});
    },
    {name: 'env'}
);

export default envPlugin;
