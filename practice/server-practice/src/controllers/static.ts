import {readFile} from 'fs/promises';
import path from 'path';
import {getExtname} from '@/helpers';
import type {IHandler} from '@/router';
import {MimeTypesExt} from '@/types';

export const createStaticHandler = (dir: string): IHandler => {
    return async (_, res, {params}): Promise<void> => {
        const filePath = path.join(dir, params['*'] ?? '');

        if (!filePath.startsWith(dir + path.sep)) {
            res.writeHead(403).end('Forbidden');
            return;
        }

        try {
            const file = await readFile(filePath);
            const ext = getExtname(filePath);
            const fileContentType = MimeTypesExt[ext] ?? 'application/octet-stream';
            res.writeHead(200, {'Content-Type': fileContentType}).end(file);
        } catch {
            res.writeHead(404).end('Not found');
        }
    };
};

export default createStaticHandler;
