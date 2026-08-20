import env from '@fastify/env';
import fp from 'fastify-plugin';
import {z} from 'zod';
import {Environment} from '@/common/const';

const schema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(Environment).default(Environment.development),
    CORS_ORIGIN: z.string(),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.coerce.number(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    REDIS_URL: z.string(),
    SMTP_HOST: z.string().default('localhost'),
    SMTP_PORT: z.coerce.number().default(1025),
    ANTHROPIC_API_KEY: z.string(),
    ANTHROPIC_MODEL: z.string(),
    ASSISTANT_CONTEXT_WINDOW: z.coerce.number().default(20),
    ASSISTANT_MAX_TOKENS: z.coerce.number().default(1024)
});

export type IEnvConfig = z.infer<typeof schema>;

const envPlugin = fp(
    async fastify => {
        const {$schema, ...jsonSchema} = z.toJSONSchema(schema);
        await fastify.register(env, {schema: jsonSchema});
    },
    {name: 'env'}
);

export default envPlugin;
