import type {Key, ReactNode} from 'react';

export const getKey = (key: unknown): Key | null | undefined => {
    if (typeof key === 'symbol') {
        return null;
    }

    if (typeof key === 'string' || typeof key === 'number') {
        return key;
    }

    return;
};

export const getValue = (value: unknown): ReactNode => {
    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }

    if (value === null || typeof value === 'undefined') {
        return null;
    }

    return String(value);
};
