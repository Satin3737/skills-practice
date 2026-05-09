import type {IValueOf} from './helpers';

export const MimeTypes = {
    html: 'text/html',
    js: 'text/javascript',
    css: 'text/css',
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
