import {type FC, useState} from 'react';
import {DataTable, type IOnTableChange} from '@/components/data-table';
import {Limit, SortOrder} from '@/const';
import type {ILimit, ISortOrder} from '@/types';
import {columns} from './columns';
import type {IUser} from './types';
import useUsers from './use-users';

const UsersDataTable: FC = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<ILimit>(Limit[5]);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<keyof IUser>('name');
    const [order, setOrder] = useState<ISortOrder>(SortOrder.asc);
    const {data, isLoading, error} = useUsers({page, search, limit, sort, order});
    const {data: tableData = [], total = 0} = data ?? {};

    const onTableChange: IOnTableChange<IUser> = ({page, search, sort, order}) => {
        setPage(page);
        setSearch(search);
        setSort(sort);
        setOrder(order);
    };

    return (
        <DataTable<IUser>
            title={'Users'}
            idKey={'id'}
            data={tableData}
            columns={columns}
            defaultSortColumn={'name'}
            isLoading={isLoading}
            error={error}
            onTableChange={onTableChange}
            pagination={{page, limit, total, setPage, setLimit}}
            showSearch={true}
        />
    );
};

export default UsersDataTable;
