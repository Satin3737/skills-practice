import clsx from 'clsx';
import type {FC} from 'react';
import styles from '../styles.module.css';
import type {IEmptyDataRowProps} from '../types';

const EmptyDataRow: FC<IEmptyDataRowProps> = ({colSpan}) => {
    return (
        <tr className={styles.row}>
            <td colSpan={colSpan} className={clsx(styles.cell, styles.emptyCell)}>
                No data
            </td>
        </tr>
    );
};

export default EmptyDataRow;
