import autoload from '@fastify/autoload';
import Fastify from 'fastify';
import path from 'path';
import {fileURLToPath} from 'url';

const srcDir = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
    logger: true,
    ajv: {customOptions: {allErrors: true}}
});

await fastify.register(autoload, {dir: path.join(srcDir, 'plugins')});
await fastify.register(autoload, {dir: path.join(srcDir, 'modules')});

const startServer = async () => {
    try {
        await fastify.listen({port: fastify.config.PORT});
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

void startServer();
