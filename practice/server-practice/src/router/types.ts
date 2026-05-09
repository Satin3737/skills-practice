import type {IMethods, IStrictMessage} from '@/types';

export type IParams = Record<string, string>;

export type IHandler = (
    req: IStrictMessage['req'],
    res: IStrictMessage['res'],
    data: {
        params: IParams;
        search: URLSearchParams;
    }
) => void | Promise<void>;

export interface IRoute {
    method: IMethods;
    path: string;
    segments: string[];
    handler: IHandler;
}

export type IRegisterRoute = Omit<IRoute, 'segments'>;

export interface IRouteResolve {
    handler: IHandler;
    params: IParams;
    search: URLSearchParams;
}
