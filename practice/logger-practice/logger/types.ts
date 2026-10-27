export const LogTypes = {
    info: 'info',
    warn: 'warn',
    error: 'error'
} as const;

export type ILogTypes = (typeof LogTypes)[keyof typeof LogTypes];

export interface ILoggerConfig {
    level: ILogTypes;
    type: ILogTypes;
    offset: number;
    fixed: number;
}

export type IExecutionTimeOptions = Partial<Omit<ILoggerConfig, 'level'>>;
