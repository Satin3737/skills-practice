import type {FastifyError, FastifyPluginOptions} from 'fastify';
import fp from 'fastify-plugin';
import {PrismaClientKnownRequestError} from '@/database/prisma/internal/prismaNamespace';

const fieldName = (err: NonNullable<FastifyError['validation']>[number]): string => {
    if (err.keyword === 'required') return String(err.params.missingProperty);
    return err.instancePath.replace(/^\//, '').replace(/\//g, '.') || '_';
};

const validationPlugin = fp<FastifyPluginOptions>(
    async fastify => {
        fastify.setErrorHandler((error: FastifyError, _, res) => {
            if (error instanceof PrismaClientKnownRequestError) {
                const meta = error.meta;

                if (error.code === 'P2025') return res.notFound('Resource not found');
                if (error.code === 'P2002') return res.conflict(`Duplicate value for ${meta?.target}`);
                if (error.code === 'P2003') return res.badRequest(`Related record not found for ${meta?.modelName}`);
            }

            if (error.validation) {
                const errors: Record<string, string> = {};

                for (const e of error.validation) {
                    const field = fieldName(e);
                    const message = e.message ?? 'invalid';

                    if (e.keyword === 'enum' && Array.isArray(e.params.allowedValues)) {
                        errors[field] = `${message}: ${e.params.allowedValues}`;
                    } else {
                        errors[field] = message;
                    }
                }

                return res.status(400).send({
                    statusCode: 400,
                    error: 'Bad Request',
                    section: error.validationContext,
                    errors
                });
            }

            res.send(error);
        });
    },
    {name: 'validation', dependencies: ['sensible']}
);

export default validationPlugin;
