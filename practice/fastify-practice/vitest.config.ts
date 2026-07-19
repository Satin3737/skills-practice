import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: [{find: /^@\//, replacement: `${path.join(rootDir, 'src')}/`}]
    },
    test: {
        environment: 'node',
        globals: false,
        setupFiles: ['./tests/setup.ts'],
        fileParallelism: false
    }
});
