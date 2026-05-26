import {ChevronFirst, ChevronLast, ChevronLeft, ChevronRight} from 'lucide-react';
import type {FC} from 'react';
import {Limit} from '@/const';
import {isLimit} from '@/helper';
import type {ILimit} from '@/types';
import {Select} from '../../select';
import styles from '../styles.module.css';
import type {ITablePaginationProps} from '../types';

const TablePagination: FC<ITablePaginationProps> = ({page, limit, total, setPage, setLimit}) => {
    const onLimitChange = (value: number) => {
        if (!isLimit(value)) return;
        setLimit(value);
        setPage(1);
    };

    return (
        <div className={styles.pagination}>
            <div className={styles.pages}>
                {!!total && (
                    <>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(1)}
                            className={styles.pageBtn}
                            aria-label={'First page'}
                        >
                            <ChevronFirst />
                        </button>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className={styles.pageBtn}
                            aria-label={'Previous page'}
                        >
                            <ChevronLeft />
                        </button>
                        <span className={styles.pageLabel}>{page}</span>
                        <button
                            disabled={page >= total}
                            onClick={() => setPage(page + 1)}
                            className={styles.pageBtn}
                            aria-label={'Next page'}
                        >
                            <ChevronRight />
                        </button>
                        <button
                            disabled={page >= total}
                            onClick={() => setPage(total)}
                            className={styles.pageBtn}
                            aria-label={'Last page'}
                        >
                            <ChevronLast />
                        </button>
                    </>
                )}
            </div>
            <Select
                value={limit}
                options={Object.entries<ILimit>(Limit).map(([key, value]) => ({value: value, label: key}))}
                onChange={e => onLimitChange(Number(e.target.value))}
            />
        </div>
    );
};

export default TablePagination;
