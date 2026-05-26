import type {Limit, SortOrder} from '@/const';

export type ISortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export type ILimit = (typeof Limit)[keyof typeof Limit];

export interface IGetRequest<T> {
    page?: number;
    limit?: ILimit;
    search?: string;
    sort?: keyof T;
    order?: ISortOrder;
}

export interface IGetResponse<T> {
    data: T[];
    total: number;
}

export type IUnknownObject<T extends Record<keyof T, unknown>> = Record<keyof T, unknown>;
