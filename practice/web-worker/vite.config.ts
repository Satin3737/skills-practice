import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: {
            '@reusable': path.resolve(import.meta.dirname, '../../reusable')
        }
    },
    server: {
        forwardConsole: true,
        port: 5177
    }
});
