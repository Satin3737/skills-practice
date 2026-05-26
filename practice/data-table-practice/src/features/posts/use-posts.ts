import {useQuery} from '@tanstack/react-query';
import {ApiBaseUrl, QueryKey} from '@/const';
import {getRequestParamsString, getTotalPages} from '@/helper';
import type {IGetRequest, IGetResponse} from '@/types';
import type {IPost} from './types';

const usePosts = (params: IGetRequest<IPost>) => {
    const {page, limit, search, sort, order} = params;

    return useQuery<IGetResponse<IPost>>({
        queryKey: [QueryKey.posts, page, limit, search, sort, order],
        queryFn: async ({signal}) => {
            const paramsString = getRequestParamsString(params);

            const response = await fetch(`${ApiBaseUrl}/posts?${paramsString}`, {signal});
            if (!response.ok) throw new Error('Failed to fetch posts');

            const data = await response.json();
            const total = getTotalPages(response.headers.get('x-total-count'), limit);
            return {data, total};
        }
    });
};

export default usePosts;
