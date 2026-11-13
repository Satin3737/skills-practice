import {httpErrors} from '@fastify/sensible';
import fp from 'fastify-plugin';

const csrfPlugin = fp(
    async fastify => {
        const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

        fastify.addHook('onRequest', async request => {
            const isMutation = mutationMethods.includes(request.method);
            if (!isMutation) return;

            const site = request.headers['sec-fetch-site'];
            if (site && site !== 'same-origin' && site !== 'none') throw httpErrors.forbidden();
        });
    },
    {name: 'csrf'}
);

export default csrfPlugin;
