import websocket from '@fastify/websocket';
import fp from 'fastify-plugin';

const websocketPlugin = fp(
    async fastify => {
        await fastify.register(websocket);
    },
    {name: 'websocket'}
);

export default websocketPlugin;
