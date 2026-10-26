import babel from '@rolldown/plugin-babel';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    plugins: [react(), babel({presets: [reactCompilerPreset()]})],
    resolve: {
        tsconfigPaths: true,
        alias: {
            '@reusable': path.resolve(import.meta.dirname, '../../reusable')
        }
    },
    test: {
        environment: 'happy-dom',
        setupFiles: ['./src/test-setup.ts']
    },
    server: {
        forwardConsole: true,
        port: 5177
    }
});
