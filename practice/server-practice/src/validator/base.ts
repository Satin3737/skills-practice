import type {IValidationResult, IValueCheck} from './types';

abstract class BaseValidator<T> {
    private readonly valueCheckQueue: IValueCheck<T>[] = [];

    private readonly typeMessage?: string;

    public constructor(typeMessage?: string) {
        this.typeMessage = typeMessage;
    }

    protected abstract valueTypeGuard(value: unknown): value is T;

    protected addValueCheck(checkCb: IValueCheck<T>): this {
        this.valueCheckQueue.push(checkCb);
        return this;
    }

    public validate(value: unknown): IValidationResult<T> {
        if (!this.valueTypeGuard(value)) return {valid: false, errors: [this.typeMessage ?? 'Invalid data type']};
        const errors = this.valueCheckQueue.map(check => check(value)).filter(error => error !== null);
        return errors.length ? {valid: false, errors} : {valid: true, data: value};
    }
}

export default BaseValidator;
