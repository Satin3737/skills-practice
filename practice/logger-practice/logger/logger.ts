import {type ILogTypes, LogTypes} from './types';

class Logger {
    private static readonly colors: Record<ILogTypes, string> = {
        [LogTypes.info]: '\x1b[34m',
        [LogTypes.warn]: '\x1b[33m',
        [LogTypes.error]: '\x1b[31m'
    };

    private static readonly reset = '\x1b[0m';

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
        options?: {type?: ILogTypes; offset?: number; fixed?: number}
    ): (...args: Parameters<T>) => ReturnType<T> {
        const {type = LogTypes.info, offset = 0, fixed = 0} = options ?? {};
        Logger.checkFixedArg(fixed);

        const funcName = func.name || 'anonymousFunc';
        const prefillLogPerformance = Logger.logPerformance(type, funcName, offset, fixed);

        return (...args: Parameters<T>): ReturnType<T> => {
            const startTime = performance.now();
            const done = (): void => prefillLogPerformance(performance.now() - startTime);

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

    private static logPerformance(type: ILogTypes, name: string, offset: number, fixed: number): CallableFunction {
        return (executionTime: number): void => {
            offset < executionTime && Logger[type](`${name} execution takes ${executionTime.toFixed(fixed)}ms`);
        };
    }

    private static log(type: ILogTypes, ...args: unknown[]): void {
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
