import type {IncomingMessage, ServerResponse} from 'http';
import type {IValueOf} from './helpers';

export interface IMessage {
    req: IncomingMessage;
    res: ServerResponse;
}

export interface IStrictMessage extends IMessage {
    req: IncomingMessage & {url: string; method: string};
}

export const Methods = {
    get: 'GET',
    post: 'POST'
} as const;

export type IMethods = IValueOf<typeof Methods>;
