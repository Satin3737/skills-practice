import type BaseValidator from './base';

export type IValueCheck<T> = (value: T) => string | null;

export type IValueError = string[];

export interface IValidationSuccess<T> {
    valid: true;
    data: T;
}

export interface IValidationError {
    valid: false;
    errors: IValueError;
}

export type IObjectShape<T> = {
    [K in keyof T]: BaseValidator<T[K]>;
};

export type IShapeInnerErrors<T> = Partial<Record<keyof T, IValueError>>;

export interface IObjectValidationError<T> extends IValidationError {
    innerErrors: IShapeInnerErrors<T>;
}

export type IValidationResult<T> = IValidationSuccess<T> | IValidationError;

export type IObjectValidationResult<T> = IValidationSuccess<T> | IObjectValidationError<T>;
