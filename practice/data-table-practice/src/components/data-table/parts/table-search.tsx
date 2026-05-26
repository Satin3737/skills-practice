import type {FC} from 'react';
import {TextInput} from '../../text-input';
import styles from '../styles.module.css';
import type {ITableSearchProps} from '../types';

const TableSearch: FC<ITableSearchProps> = ({search, setSearch}) => {
    return (
        <div className={styles.filters}>
            <TextInput value={search} onChange={e => setSearch(e.target.value)} placeholder={'Search...'} />
        </div>
    );
};

export default TableSearch;
