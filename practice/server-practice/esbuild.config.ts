import esbuild from 'esbuild';
import {cpSync, rmSync} from 'fs';

rmSync('dist', {recursive: true, force: true});

await Promise.all([
    esbuild.build({
        entryPoints: ['src/app.ts'],
        bundle: true,
        sourcemap: true,
        packages: 'external',
        format: 'esm',
        platform: 'node',
        outdir: 'dist'
    }),
    esbuild.build({
        entryPoints: ['src/assets/styles/index.css'],
        bundle: true,
        outdir: 'dist/assets/styles'
    })
]).catch(() => process.exit(1));

cpSync('src/assets/favicon', 'dist/assets/favicon', {recursive: true});
