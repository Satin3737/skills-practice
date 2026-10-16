import {BaseUrl} from '@/const';
import AppServer from '@/server';

const app = new AppServer();

try {
    await app.start();
    app.listenShutdown();
    console.log('Server started:', BaseUrl);
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}
