import BaseValidator from './base';

class NumberValidator extends BaseValidator<number> {
    public constructor(typeMessage?: string) {
        super(typeMessage || 'Must be a number');
    }

    protected valueTypeGuard(value: unknown): value is number {
        return typeof value === 'number';
    }

    public integer(message?: string): this {
        return this.addValueCheck(value => {
            return Number.isInteger(value) ? null : (message ?? 'Must be an integer');
        });
    }

    public min(minValue: number, message?: string): this {
        return this.addValueCheck(value => {
            return value >= minValue ? null : (message ?? `Must be greater than or equal to ${minValue}`);
        });
    }
}

export default NumberValidator;
