import {useQuery} from '@tanstack/react-query';
import {ApiBaseUrl, QueryKey} from '@/const';
import {getRequestParamsString, getTotalPages} from '@/helper';
import type {IGetRequest, IGetResponse} from '@/types';
import type {IComment} from './types';

const useComments = (params: IGetRequest<IComment>) => {
    const {page, limit, search, sort, order} = params;

    return useQuery<IGetResponse<IComment>>({
        queryKey: [QueryKey.comments, page, limit, search, sort, order],
        queryFn: async ({signal}) => {
            const paramsString = getRequestParamsString(params);

            const response = await fetch(`${ApiBaseUrl}/comments?${paramsString}`, {signal});
            if (!response.ok) throw new Error('Failed to fetch comments');

            const data = await response.json();
            const total = getTotalPages(response.headers.get('x-total-count'), limit);
            return {data, total};
        }
    });
};

export default useComments;
