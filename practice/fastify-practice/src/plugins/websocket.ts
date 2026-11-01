import websocket from '@fastify/websocket';
import fp from 'fastify-plugin';

const websocketPlugin = fp(
    async fastify => {
        await fastify.register(websocket, {options: {maxPayload: 64 * 1024}});
    },
    {name: 'websocket'}
);

export default websocketPlugin;
