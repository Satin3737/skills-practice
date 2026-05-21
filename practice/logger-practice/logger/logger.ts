import {type ILogTypes, LogTypes} from './types';

class Logger {
    private static readonly colors: Record<ILogTypes, string> = {
        [LogTypes.info]: '\x1b[34m',
        [LogTypes.warn]: '\x1b[33m',
        [LogTypes.error]: '\x1b[31m'
    };

    private static readonly reset = '\x1b[0m';

    public static info(...args: unknown[]): void {
        this.log(LogTypes.info, ...args);
    }

    public static warn(...args: unknown[]): void {
        this.log(LogTypes.warn, ...args);
    }

    public static error(...args: unknown[]): void {
        this.log(LogTypes.error, ...args);
    }

    public static checkFunctionExecutionTime<T extends (...args: Parameters<T>) => ReturnType<T>>(
        func: T,
        options?: {type?: ILogTypes; offset?: number; fixed?: number}
    ): (...args: Parameters<T>) => ReturnType<T> {
        const {type = LogTypes.warn, offset = 0, fixed = 0} = options ?? {};

        return (...args: Parameters<T>): ReturnType<T> => {
            const prefillLogPerformance = this.logPerformance(type, func.name, offset, fixed);
            const startTime = performance.now();
            const result = func(...args);

            if (result instanceof Promise) {
                return result.then(res => {
                    prefillLogPerformance(performance.now() - startTime);
                    return res;
                }) as ReturnType<T>;
            }

            prefillLogPerformance(performance.now() - startTime);
            return result;
        };
    }

    private static logPerformance(type: ILogTypes, name: string, offset: number, fixed: number): CallableFunction {
        return (executionTime: number): void => {
            offset <= executionTime && this[type](`${name} execution takes ${executionTime.toFixed(fixed)}ms`);
        };
    }

    private static log(type: ILogTypes, ...args: unknown[]): void {
        const date = new Date().toLocaleString();
        const color = this.colors[type];
        console.log(`${color}[${type}]${this.reset}[${date}]: `, ...args);
    }
}

export default Logger;
