export const LogTypes = {
    info: 'info',
    warn: 'warn',
    error: 'error'
} as const;

export type ILogTypes = (typeof LogTypes)[keyof typeof LogTypes];
