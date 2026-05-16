import esbuild from 'esbuild';
import {cpSync, rmSync} from 'fs';
import path from 'path';

rmSync('dist', {recursive: true, force: true});

const alias = {
    '@reusable': path.resolve(import.meta.dirname, '../../../reusable')
};

await Promise.all([
    esbuild.build({
        entryPoints: ['src/app.ts'],
        bundle: true,
        sourcemap: true,
        packages: 'external',
        format: 'esm',
        platform: 'node',
        outdir: 'dist',
        alias
    }),
    esbuild.build({
        entryPoints: ['src/assets/_styles/index.css'],
        bundle: true,
        outdir: 'dist/assets/styles',
        alias
    })
]).catch(() => process.exit(1));

cpSync('src/assets/favicon', 'dist/assets/favicon', {recursive: true});
