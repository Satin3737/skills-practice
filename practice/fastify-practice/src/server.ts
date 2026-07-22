import autoload from '@fastify/autoload';
import Fastify, {type FastifyInstance} from 'fastify';
import path from 'path';
import {fileURLToPath} from 'url';
import {getLoggerConfig} from '@/common/logger';

class Server {
    public readonly app: FastifyInstance;
    private readonly srcDir: string;

    public constructor() {
        this.srcDir = path.dirname(fileURLToPath(import.meta.url));

        this.app = Fastify({
            logger: getLoggerConfig(),
            ajv: {customOptions: {allErrors: true}}
        });
    }

    public async build(): Promise<FastifyInstance> {
        await this.app.register(autoload, {dir: path.join(this.srcDir, 'plugins'), maxDepth: 1});
        await this.app.register(autoload, {dir: path.join(this.srcDir, 'modules'), maxDepth: 1});
        return this.app;
    }

    public async listen(): Promise<void> {
        try {
            await this.app.listen({port: this.app.config.PORT});
        } catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    }
}

export default Server;
