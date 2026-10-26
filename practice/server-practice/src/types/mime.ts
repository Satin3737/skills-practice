import type {IValueOf} from './helpers';

export const MimeTypes = {
    html: 'text/html; charset=utf-8',
    js: 'text/javascript; charset=utf-8',
    css: 'text/css; charset=utf-8',
    txt: 'text/plain; charset=utf-8',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    ico: 'image/x-icon'
} as const;

export const MimeTypesExt = Object.fromEntries<IMimeTypes>(
    Object.entries(MimeTypes).map(([type, mime]) => {
        return [`.${type}`, mime] as const;
    })
);

export type IMimeTypes = IValueOf<typeof MimeTypes>;
