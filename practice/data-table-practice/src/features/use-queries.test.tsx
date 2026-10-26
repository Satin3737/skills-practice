import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';
import type {ReactNode} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {ApiBaseUrl} from '@/const';
import useComments from './comments/use-comments';
import usePosts from './posts/use-posts';
import useUsers from './users/use-users';

const wrapper = ({children}: {children: ReactNode}) => (
    <QueryClientProvider client={new QueryClient({defaultOptions: {queries: {retry: false}}})}>
        {children}
    </QueryClientProvider>
);

const mockFetch = (response: Partial<Response>) => {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe.each([
    ['useUsers', useUsers, 'users'],
    ['usePosts', usePosts, 'posts'],
    ['useComments', useComments, 'comments']
] as const)('%s', (_, useHook, resource) => {
    it('requests the resource with query params and returns data with the page count', async () => {
        const rows = [{id: 1}];
        const fetchMock = mockFetch({ok: true, json: async () => rows, headers: new Headers({'x-total-count': '23'})});

        const {result} = renderHook(
            () => useHook({page: 2, limit: 10, search: 'x', sort: 'id' as never, order: 'desc'}),
            {wrapper}
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({data: rows, total: 3});

        const [url, init] = fetchMock.mock.calls[0];
        const parsed = new URL(url);
        expect(`${parsed.origin}${parsed.pathname}`).toBe(`${ApiBaseUrl}/${resource}`);
        expect(Object.fromEntries(parsed.searchParams)).toEqual({
            _page: '2',
            _limit: '10',
            q: 'x',
            _sort: 'id',
            _order: 'desc'
        });
        expect(init.signal).toBeInstanceOf(AbortSignal);
    });

    it('errors when the response is not ok', async () => {
        mockFetch({ok: false});

        const {result} = renderHook(() => useHook({}), {wrapper});

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe(`Failed to fetch ${resource}`);
    });
});
