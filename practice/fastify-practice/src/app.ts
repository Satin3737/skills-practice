import Server from '@/server';

const server = new Server();
await server.build();
await server.listen();
