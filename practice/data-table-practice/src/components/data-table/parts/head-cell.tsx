import clsx from 'clsx';
import {ArrowDown01, ArrowUp10, ArrowUpDown} from 'lucide-react';
import {SortOrder} from '@/const';
import type {IUnknownObject} from '@/types';
import styles from '../styles.module.css';
import type {IHeadCellProps} from '../types';

const HeadCell = <T extends IUnknownObject<T>>({column, sortOrder, sortColumn, onSortChange}: IHeadCellProps<T>) => {
    const isColumnSorted = sortColumn === column.dataKey;

    return (
        <th className={clsx(styles.cell, styles.headCell)}>
            {column.sortable ? (
                <button
                    type={'button'}
                    className={clsx(styles.head, styles.sortable)}
                    onClick={() => onSortChange(column.dataKey)}
                >
                    {column.title}
                    <span className={clsx(styles.sortIcon, isColumnSorted && styles.activeSort)}>
                        {isColumnSorted ? (
                            sortOrder === SortOrder.asc ? (
                                <ArrowDown01 />
                            ) : (
                                <ArrowUp10 />
                            )
                        ) : (
                            <ArrowUpDown />
                        )}
                    </span>
                </button>
            ) : (
                <div className={styles.head}>{column.title}</div>
            )}
        </th>
    );
};

export default HeadCell;
