import clsx from 'clsx';
import {useEffect, useState} from 'react';
import {Limit, SortOrder} from '@/const';
import type {ISortOrder, IUnknownObject} from '@/types';
import {getKey, getValue} from './helper';
import {EmptyDataRow, ErrorRow, HeadCell, TableFilters, TablePagination} from './parts';
import styles from './styles.module.css';
import type {IDataTableProps} from './types';

const DataTable = <T extends IUnknownObject<T>>({
    idKey,
    title,
    data,
    columns,
    defaultSortColumn,
    isLoading,
    error,
    pagination,
    showSearch,
    onTableChange
}: IDataTableProps<T>) => {
    const [searchData, setSearchData] = useState<string>('');
    const [sortColumn, setSortColumn] = useState<keyof T>(defaultSortColumn);
    const [sortOrder, setSortOrder] = useState<ISortOrder>(SortOrder.asc);

    const onSortChange = (column: keyof T) => {
        if (column === sortColumn) {
            setSortOrder(sortOrder === SortOrder.asc ? SortOrder.desc : SortOrder.asc);
        } else {
            setSortColumn(column);
            setSortOrder(SortOrder.asc);
        }
    };

    useEffect(() => {
        if (!onTableChange) return;
        onTableChange({page: 1, search: searchData, sort: sortColumn, order: sortOrder});
    }, [searchData, sortColumn, sortOrder, onTableChange]);

    return (
        <div className={styles.wrapper}>
            {!!title && <h2 className={'title'}>{title}</h2>}
            {!!showSearch && <TableFilters search={searchData} setSearch={setSearchData} />}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map(column => (
                                <HeadCell
                                    key={getKey(column.dataKey)}
                                    column={column}
                                    sortOrder={sortOrder}
                                    sortColumn={sortColumn}
                                    onSortChange={onSortChange}
                                />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({length: pagination?.limit ?? Limit[5]}).map((_, index) => (
                                <tr key={index} className={styles.row}>
                                    {columns.map(column => (
                                        <td key={getKey(column.dataKey)} className={clsx(styles.cell, styles.bodyCell)}>
                                            <div className={styles.skeleton} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length ? (
                            data.map(item => (
                                <tr key={getKey(item[idKey])} className={styles.row}>
                                    {columns.map(column => (
                                        <td key={getKey(column.dataKey)} className={clsx(styles.cell, styles.bodyCell)}>
                                            {getValue(item[column.dataKey])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : error ? (
                            <ErrorRow colSpan={columns.length} error={error} />
                        ) : (
                            <EmptyDataRow colSpan={columns.length} />
                        )}
                    </tbody>
                </table>
            </div>
            {!!pagination && <TablePagination {...pagination} />}
        </div>
    );
};

export default DataTable;
