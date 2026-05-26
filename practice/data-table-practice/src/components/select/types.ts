import type {SelectHTMLAttributes} from 'react';

export interface ISelectOption {
    value: string | number;
    label: string;
}

export interface ISelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: ISelectOption[];
    label?: string;
    placeholder?: string;
}
