import path from 'path';
import {BaseUrl} from '@/const';
import type {IMessage} from '@/types';

export const parseUrl = (url: string): {url: string; search: URLSearchParams} => {
    const {pathname, searchParams} = new URL(url, BaseUrl);
    return {url: pathname, search: searchParams};
};

export const getExtname = (filePath: string): string => {
    return path.extname(filePath).toLowerCase();
};

export const parseBody = (req: IMessage['req']): Promise<Record<string, string>> => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(body))));
        req.on('error', reject);
    });
};
