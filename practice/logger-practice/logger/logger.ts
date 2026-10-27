import {type IExecutionTimeOptions, type ILogTypes, type ILoggerConfig, LogTypes} from './types';

class Logger {
    private static readonly levels: Record<ILogTypes, number> = {
        [LogTypes.info]: 0,
        [LogTypes.warn]: 1,
        [LogTypes.error]: 2
    };

    private static readonly colors: Record<ILogTypes, string> = {
        [LogTypes.info]: '\x1b[34m',
        [LogTypes.warn]: '\x1b[33m',
        [LogTypes.error]: '\x1b[31m'
    };

    private static readonly reset = '\x1b[0m';

    private static config: ILoggerConfig = {
        level: LogTypes.info,
        type: LogTypes.info,
        offset: 0,
        fixed: 0
    };

    public static configure(config: Partial<ILoggerConfig>): void {
        const newConfig = {...Logger.config, ...config};
        Logger.checkFixedArg(newConfig.fixed);
        Logger.config = newConfig;
    }

    public static info(...args: unknown[]): void {
        Logger.log(LogTypes.info, ...args);
    }

    public static warn(...args: unknown[]): void {
        Logger.log(LogTypes.warn, ...args);
    }

    public static error(...args: unknown[]): void {
        Logger.log(LogTypes.error, ...args);
    }

    public static checkFunctionExecutionTime<T extends (...args: Parameters<T>) => ReturnType<T>>(
        func: T,
        options: IExecutionTimeOptions = {}
    ): (...args: Parameters<T>) => ReturnType<T> {
        options.fixed !== undefined && Logger.checkFixedArg(options.fixed);

        const funcName = func.name || 'anonymousFunc';

        return (...args: Parameters<T>): ReturnType<T> => {
            const startTime = performance.now();
            const done = (): void => Logger.logPerformance(funcName, performance.now() - startTime, options);

            let result: ReturnType<T>;

            try {
                result = func(...args);
            } catch (error) {
                done();
                throw error;
            }

            if (Logger.isThenable(result)) {
                result.then(done, done);
                return result;
            }

            done();
            return result;
        };
    }

    private static logPerformance(name: string, executionTime: number, options: IExecutionTimeOptions): void {
        const {type, offset, fixed} = {...Logger.config, ...options};
        offset < executionTime && Logger[type](`${name} execution takes ${executionTime.toFixed(fixed)}ms`);
    }

    private static log(type: ILogTypes, ...args: unknown[]): void {
        if (Logger.levels[type] < Logger.levels[Logger.config.level]) return;
        const date = new Date().toLocaleString();
        const tag = process.env.NO_COLOR ? `[${type}]` : `${Logger.colors[type]}[${type}]${Logger.reset}`;
        console.log(`${tag}[${date}]: `, ...args);
    }

    private static checkFixedArg(fixed: number): void {
        if (!Number.isInteger(fixed) || fixed < 0 || fixed > 100) {
            throw new RangeError(`fixed arg must be integer between 0 and 100, receivd ${fixed}`);
        }
    }

    private static isThenable(value: unknown): value is Promise<unknown> {
        return value !== null && typeof value === 'object' && 'then' in value && typeof value.then === 'function';
    }
}

export default Logger;
