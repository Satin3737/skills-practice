import babel from '@rolldown/plugin-babel';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
    plugins: [react(), babel({presets: [reactCompilerPreset()]})],
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
