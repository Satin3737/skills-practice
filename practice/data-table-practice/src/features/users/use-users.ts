import {useQuery} from '@tanstack/react-query';
import {ApiBaseUrl, QueryKey} from '@/const';
import {getRequestParamsString, getTotalPages} from '@/helper';
import type {IGetRequest, IGetResponse} from '@/types';
import type {IUser} from './types';

const useUsers = (params: IGetRequest<IUser>) => {
    const {page, limit, search, sort, order} = params;

    return useQuery<IGetResponse<IUser>>({
        queryKey: [QueryKey.users, page, limit, search, sort, order],
        queryFn: async ({signal}) => {
            const paramsString = getRequestParamsString(params);

            const response = await fetch(`${ApiBaseUrl}/users?${paramsString}`, {signal});
            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            const total = getTotalPages(response.headers.get('x-total-count'), limit);
            return {data, total};
        }
    });
};

export default useUsers;
