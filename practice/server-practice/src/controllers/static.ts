import {readFile} from 'fs/promises';
import path from 'path';
import {AssetsDir} from '@/const';
import {getExtname, parseUrl} from '@/helpers';
import type {IHandler} from '@/router';
import {MimeTypesExt} from '@/types';

export const staticHandler: IHandler = async (req, res): Promise<void> => {
    const parsed = parseUrl(req.url);
    const relativePath = parsed.url.split('/assets/')[1];
    const filePath = path.join(AssetsDir, relativePath);

    if (!filePath.startsWith(AssetsDir)) {
        res.writeHead(403).end('Forbidden');
        return;
    }

    try {
        const file = await readFile(filePath, 'utf8');
        const ext = getExtname(filePath);
        const contentType = MimeTypesExt[ext] ?? 'application/octet-stream';
        res.writeHead(200, {'Content-Type': contentType}).end(file);
    } catch (e) {
        console.error(e);
        res.writeHead(404).end('Not found');
    }
};

export default staticHandler;
