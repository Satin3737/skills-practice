import 'dotenv/config';
import autoload from '@fastify/autoload';
import Fastify from 'fastify';
import path from 'path';
import {fileURLToPath} from 'url';
import {Environment} from '@/common/const';

const srcDir = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
    logger: {
        ...(process.env.NODE_ENV === Environment.development && {
            level: 'debug',
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard'
                }
            }
        })
    },
    ajv: {customOptions: {allErrors: true}}
});

await fastify.register(autoload, {dir: path.join(srcDir, 'plugins'), maxDepth: 1});
await fastify.register(autoload, {dir: path.join(srcDir, 'modules'), maxDepth: 1});

const startServer = async () => {
    try {
        await fastify.listen({port: fastify.config.PORT});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

void startServer();
