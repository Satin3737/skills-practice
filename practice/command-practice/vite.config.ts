import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
        alias: {
            '@reusable': path.resolve(import.meta.dirname, '../../reusable')
        }
    },
    test: {
        environment: 'happy-dom'
    },
    server: {
        forwardConsole: true,
        port: 5177
    }
});
