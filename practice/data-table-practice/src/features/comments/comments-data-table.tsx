import {type FC, useState} from 'react';
import {DataTable, type IOnTableChange} from '@/components/data-table';
import {Limit, SortOrder} from '@/const';
import useList from '@/hooks/use-list';
import type {ILimit, ISortOrder} from '@/types';
import {columns} from './columns';
import type {IComment} from './types';

const CommentsDataTable: FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<ILimit>(Limit[10]);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<keyof IComment>('postId');
    const [order, setOrder] = useState<ISortOrder>(SortOrder.asc);
    const {data, isLoading, error} = useList<IComment>('comments', {page, search, limit, sort, order});
    const {data: tableData = [], total = 0} = data ?? {};

    const onTableChange: IOnTableChange<IComment> = ({page, search, sort, order}) => {
        setPage(page);
        setSearch(search);
        setSort(sort);
        setOrder(order);
    };

    return (
        <DataTable<IComment>
            title={'Comments'}
            idKey={'id'}
            data={tableData}
            columns={columns}
            sort={sort}
            order={order}
            search={search}
            isLoading={isLoading}
            error={error}
            onTableChange={onTableChange}
            pagination={{page, limit, total, setPage, setLimit}}
            showSearch={true}
        />
    );
};

export default CommentsDataTable;
