import {defineConfig} from 'vite';

export default defineConfig({
    resolve: {
        tsconfigPaths: true
    },
    server: {
        forwardConsole: true,
        port: 5177
    }
});
