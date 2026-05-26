import {Limit} from '@/const';
import type {IGetRequest, ILimit} from './types';

export const isLimit = (value: number): value is ILimit => {
    return Object.values<number>(Limit).includes(value);
};

export const getRequestParamsString = <T>(params: IGetRequest<T>): string => {
    const {page, limit, search, sort, order} = params;

    return new URLSearchParams({
        ...(page !== undefined && {_page: String(page)}),
        ...(limit !== undefined && {_limit: String(limit)}),
        ...(sort !== undefined && {_sort: String(sort)}),
        ...(search !== undefined && {q: search}),
        ...(order !== undefined && {_order: order})
    }).toString();
};

export const getTotalPages = (totalHeader: string | null, limit: ILimit = Limit[5]): number => {
    const converted = Number(totalHeader ?? '0');
    return isNaN(converted) ? 0 : Math.ceil(converted / limit);
};
