import path from 'path';
import {BaseUrl, BodyLimit} from '@/const';
import {BodyTooBigError} from '@/errors';
import type {IMessage} from '@/types';

const slashPrefix = /^[/\\]{2}/;

export const parseUrl = (url: string): {url: string; search: URLSearchParams} | null => {
    if (slashPrefix.test(url)) return null;

    try {
        const {pathname, searchParams} = new URL(url, BaseUrl);
        return {url: pathname, search: searchParams};
    } catch {
        return null;
    }
};

export const getExtname = (filePath: string): string => {
    return path.extname(filePath).toLowerCase();
};

export const parseBody = (req: IMessage['req'], bodyLimit: number = BodyLimit): Promise<Record<string, string>> => {
    return new Promise((resolve, reject) => {
        if (Number(req.headers['content-length'] || 0) > bodyLimit) return reject(new BodyTooBigError());

        const chunks: Buffer[] = [];
        let currentSize: number = 0;

        req.on('data', (chunk: Buffer) => {
            currentSize += chunk.length;
            if (currentSize > bodyLimit) return reject(new BodyTooBigError());
            chunks.push(chunk);
        });

        req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString()))));
        req.on('error', reject);
    });
};

export const escapeHtml = (str: string): string => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};
