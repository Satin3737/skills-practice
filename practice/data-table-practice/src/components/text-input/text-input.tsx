import type {FC} from 'react';
import styles from './styles.module.css';
import type {ITextInputProps} from './types';

const TextInput: FC<ITextInputProps> = ({label, ...rest}) => {
    return (
        <label className={styles.wrap}>
            {!!label && <div className={styles.label}>{label}</div>}
            <input {...rest} className={styles.input} />
        </label>
    );
};

export default TextInput;
