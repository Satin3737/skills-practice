import {useQuery} from '@tanstack/react-query';
import {ApiBaseUrl} from '@/const';
import {getRequestParamsString, getTotalPages} from '@/helper';
import type {IGetRequest, IGetResponse} from '@/types';

const useList = <T>(resource: string, params: IGetRequest<T>) => {
    return useQuery<IGetResponse<T>>({
        queryKey: [resource, params],
        queryFn: async ({signal}) => {
            const paramsString = getRequestParamsString(params);

            const response = await fetch(`${ApiBaseUrl}/${resource}?${paramsString}`, {signal});
            if (!response.ok) throw new Error(`Failed to fetch ${resource}`);

            const data = await response.json();
            const total = getTotalPages(response.headers.get('x-total-count'), params.limit);
            return {data, total};
        }
    });
};

export default useList;
