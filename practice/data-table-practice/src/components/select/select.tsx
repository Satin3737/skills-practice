import {ChevronDown} from 'lucide-react';
import type {FC} from 'react';
import styles from './styles.module.css';
import type {ISelectProps} from './types';

const Select: FC<ISelectProps> = ({label, options, placeholder, ...rest}) => (
    <label className={styles.wrap}>
        {!!label && <div className={styles.label}>{label}</div>}
        <div className={styles.field}>
            <select {...rest} className={styles.select}>
                {!!placeholder && (
                    <option value={''} disabled>
                        {placeholder}
                    </option>
                )}
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className={styles.chevron} size={16} aria-hidden={'true'} />
        </div>
    </label>
);

export default Select;
