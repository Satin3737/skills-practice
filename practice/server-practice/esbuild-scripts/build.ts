import esbuild from 'esbuild';
import {cpSync, rmSync} from 'fs';
import path from 'path';

rmSync('dist', {recursive: true, force: true});

await esbuild
    .build({
        entryPoints: ['src/assets/_styles/index.css'],
        bundle: true,
        outdir: 'dist/assets/styles',
        alias: {
            '@reusable': path.resolve(import.meta.dirname, '../../../reusable')
        }
    })
    .catch(() => process.exit(1));

cpSync('src/assets/favicon', 'dist/assets/favicon', {recursive: true});
