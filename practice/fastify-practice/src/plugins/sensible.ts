import sensible, {type FastifySensibleOptions} from '@fastify/sensible';
import fp from 'fastify-plugin';

const sensiblePlugin = fp<FastifySensibleOptions>(async fastify => {
    await fastify.register(sensible);
});

export default sensiblePlugin;
