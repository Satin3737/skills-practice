import esbuild from 'esbuild';
import {cpSync, rmSync} from 'fs';
import path from 'path';

rmSync('dist', {recursive: true, force: true});
cpSync('src/public', 'dist/public', {recursive: true});

await esbuild
    .build({
        entryPoints: ['src/styles/index.css'],
        bundle: true,
        outdir: 'dist/public/assets/styles',
        alias: {
            '@reusable': path.resolve(import.meta.dirname, '../../../reusable')
        }
    })
    .catch(() => process.exit(1));
