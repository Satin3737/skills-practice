import esbuild from 'esbuild';
import {rmSync} from 'fs';

rmSync('dist', {recursive: true, force: true});

esbuild
    .build({
        entryPoints: ['src/app.ts'],
        bundle: false,
        sourcemap: true,
        packages: 'external',
        format: 'esm',
        platform: 'node',
        outdir: 'dist'
    })
    .catch(() => process.exit(1));
