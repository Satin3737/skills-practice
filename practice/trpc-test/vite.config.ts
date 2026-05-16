import {defineConfig} from 'vite';

export default defineConfig({
    root: 'src/client',
    resolve: {
        tsconfigPaths: true
    },
    server: {
        forwardConsole: true,
        port: 5177
    }
});
