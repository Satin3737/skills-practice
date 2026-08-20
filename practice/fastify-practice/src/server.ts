import autoload from '@fastify/autoload';
import Fastify, {type FastifyInstance} from 'fastify';
import {type ZodTypeProvider, serializerCompiler, validatorCompiler} from 'fastify-type-provider-zod';
import path from 'path';
import {getLoggerConfig} from '@/common/logger';

class Server {
    public readonly app: FastifyInstance;

    public constructor() {
        this.app = Fastify({
            logger: getLoggerConfig(),
            ajv: {customOptions: {allErrors: true}}
        }).withTypeProvider<ZodTypeProvider>();

        this.app.setValidatorCompiler(validatorCompiler);
        this.app.setSerializerCompiler(serializerCompiler);
    }

    public async build(): Promise<FastifyInstance> {
        const srcDir = import.meta.dirname;
        await this.app.register(autoload, {dir: path.join(srcDir, 'plugins'), maxDepth: 1});
        await this.app.register(autoload, {dir: path.join(srcDir, 'modules'), maxDepth: 1});
        return this.app;
    }

    public async listen(): Promise<void> {
        try {
            await this.app.listen({port: this.app.config.PORT});
            this.listenShutdownProcessSignals();
        } catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    }

    private listenShutdownProcessSignals(): void {
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    }

    private async shutdown(signal: string): Promise<void> {
        this.app.log.info(`Shutting down server due to ${signal}...`);

        try {
            await this.app.close();
            process.exit(0);
        } catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    }
}

export default Server;
