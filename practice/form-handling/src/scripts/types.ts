import type {z} from 'zod';

export interface IFormValues {
    name: string;
    surname: string;
    age: number;
    email: string;
    color: string;
    preferences: string[];
    comment: string;
}

export type IError = Pick<z.core.$ZodIssue, 'path' | 'message'>;
