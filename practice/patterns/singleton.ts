class Logger {
    private static _instance: Logger;

    public static get instance(): Logger {
        if (!this._instance) this._instance = new Logger();
        return this._instance;
    }

    public info(...args: unknown[]): void {
        this.log('info', ...args);
    }

    public warn(...args: unknown[]): void {
        this.log('warn', ...args);
    }

    public error(...args: unknown[]): void {
        this.log('error', ...args);
    }

    private log(type: string, ...args: unknown[]): void {
        const date = new Date().toLocaleString();
        console.log(`[${type}]$[${date}]: `, ...args);
    }
}

console.log('Logger instance:', Logger.instance instanceof Logger);
Logger.instance.info('Test info');
Logger.instance.warn('Test warn');
Logger.instance.error('Test error');
