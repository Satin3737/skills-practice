import 'dotenv/config';
import type {LoggerOptions} from 'pino';
import {Environment} from './const';

export const getLoggerConfig = (): LoggerOptions => {
    switch (process.env.NODE_ENV) {
        case Environment.development:
            return {
                level: 'debug',
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'SYS:standard'
                    }
                }
            };
        case Environment.test:
            return {level: 'silent'};
        default:
            return {level: 'info'};
    }
};
