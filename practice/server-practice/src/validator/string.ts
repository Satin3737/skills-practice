import BaseValidator from './base';

class StringValidator extends BaseValidator<string> {
    private readonly idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    public constructor(typeMessage?: string) {
        super(typeMessage ?? 'Must be a string');
    }

    protected valueTypeGuard(value: unknown): value is string {
        return typeof value === 'string';
    }

    public min(length: number, message?: string): this {
        return this.addValueCheck(value => {
            return value.length >= length ? null : (message ?? `Must be at least ${length} characters long`);
        });
    }

    public max(length: number, message?: string): this {
        return this.addValueCheck(value => {
            return value.length <= length ? null : (message ?? `Must be at most ${length} characters long`);
        });
    }

    public notEmpty(message?: string): this {
        return this.addValueCheck(value => {
            return value.trim().length ? null : (message ?? 'Cannot be empty');
        });
    }

    public uuid(message?: string): this {
        return this.addValueCheck(value => {
            return this.idPattern.test(value) ? null : (message ?? 'Must be a valid UUID');
        });
    }
}

export default StringValidator;
