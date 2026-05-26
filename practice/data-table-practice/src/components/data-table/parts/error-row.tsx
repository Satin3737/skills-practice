import clsx from 'clsx';
import type {FC} from 'react';
import styles from '../styles.module.css';
import type {IErrorRowProps} from '../types';

const ErrorRow: FC<IErrorRowProps> = ({colSpan, error}) => {
    return (
        <tr className={styles.row}>
            <td colSpan={colSpan} className={clsx(styles.cell, styles.errorCell)}>
                {error.message}
            </td>
        </tr>
    );
};

export default ErrorRow;
