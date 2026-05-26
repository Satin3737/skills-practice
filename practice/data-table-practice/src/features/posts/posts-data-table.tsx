import {type FC, useState} from 'react';
import {DataTable, type IOnTableChange} from '@/components/data-table';
import {Limit, SortOrder} from '@/const';
import type {ILimit, ISortOrder} from '@/types';
import {columns} from './columns';
import type {IPost} from './types';
import usePosts from './use-posts';

const PostsDataTable: FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<ILimit>(Limit[5]);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<keyof IPost>('id');
    const [order, setOrder] = useState<ISortOrder>(SortOrder.asc);
    const {data, isLoading, error} = usePosts({page, search, limit, sort, order});
    const {data: tableData = [], total = 0} = data ?? {};

    const onTableChange: IOnTableChange<IPost> = ({page, search, sort, order}) => {
        setPage(page);
        setSearch(search);
        setSort(sort);
        setOrder(order);
    };

    return (
        <DataTable<IPost>
            title={'Posts'}
            idKey={'id'}
            data={tableData}
            columns={columns}
            defaultSortColumn={'id'}
            isLoading={isLoading}
            error={error}
            onTableChange={onTableChange}
            pagination={{page, limit, total, setPage, setLimit}}
            showSearch={true}
        />
    );
};

export default PostsDataTable;
