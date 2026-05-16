import {spawn} from 'child_process';
import esbuild from 'esbuild';
import path from 'path';

const ctx = await esbuild.context({
    entryPoints: ['src/assets/_styles/index.css'],
    bundle: true,
    outdir: 'src/assets/styles',
    alias: {
        '@reusable': path.resolve(import.meta.dirname, '../../../reusable')
    }
});

await ctx.watch();
console.log('[esbuild] watching CSS → src/assets/styles');

const server = spawn('tsx', ['watch', 'src/app.ts'], {stdio: 'inherit'});

const shutdown = async (code = 0) => {
    server.kill();
    await ctx.dispose();
    process.exit(code);
};

server.on('exit', code => shutdown(code ?? 0));
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
