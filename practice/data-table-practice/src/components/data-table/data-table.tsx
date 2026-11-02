import clsx from 'clsx';
import {Limit, SortOrder} from '@/const';
import type {IUnknownObject} from '@/types';
import {getKey, getValue} from './helper';
import {EmptyDataRow, ErrorRow, HeadCell, TableFilters, TablePagination} from './parts';
import styles from './styles.module.css';
import type {IDataTableProps} from './types';

const DataTable = <T extends IUnknownObject<T>>({
    idKey,
    title,
    data,
    columns,
    sort,
    order,
    search = '',
    isLoading,
    error,
    pagination,
    showSearch,
    onTableChange
}: IDataTableProps<T>) => {
    const onSortChange = (column: keyof T) => {
        const nextOrder = column === sort && order === SortOrder.asc ? SortOrder.desc : SortOrder.asc;
        onTableChange?.({page: 1, search, sort: column, order: nextOrder});
    };

    const onSearchChange = (value: string) => {
        onTableChange?.({page: 1, search: value, sort, order});
    };

    return (
        <div className={styles.wrapper}>
            {!!title && <h2 className={'title'}>{title}</h2>}
            {!!showSearch && <TableFilters search={search} setSearch={onSearchChange} />}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map(column => (
                                <HeadCell
                                    key={getKey(column.dataKey)}
                                    column={column}
                                    sortOrder={order}
                                    sortColumn={sort}
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
