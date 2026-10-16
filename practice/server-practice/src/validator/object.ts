import BaseValidator from './base';
import type {IObjectShape, IObjectValidationResult, IShapeInnerErrors} from './types';

class ObjectValidator<T extends object> extends BaseValidator<T> {
    private readonly shape: IObjectShape<T>;

    public constructor(shape: IObjectShape<T>, typeMessage?: string) {
        super(typeMessage || 'Must be an object');
        this.shape = shape;
    }

    protected valueTypeGuard(value: unknown): value is T {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    public override validate(value: unknown): IObjectValidationResult<T> {
        const objectResult = super.validate(value);
        const data: Partial<T> = {};
        const innerErrors: IShapeInnerErrors<T> = {};

        if (!objectResult.valid) return {...objectResult, innerErrors};
        const input = objectResult.data;

        for (const key in this.shape) {
            const fieldResult = this.shape[key].validate(input[key]);
            if (fieldResult.valid) data[key] = fieldResult.data;
            else innerErrors[key] = fieldResult.errors;
        }

        if (Object.keys(innerErrors).length || !this.isShapeFilled(data)) {
            return {valid: false, errors: this.flattenInnerErrors(innerErrors), innerErrors};
        }

        return {valid: true, data};
    }

    private flattenInnerErrors(innerErrors: IShapeInnerErrors<T>): string[] {
        return Object.entries<string[] | undefined>(innerErrors).flatMap(([key, errors = []]) => {
            return errors.map(error => `${key}: ${error}`);
        });
    }

    private isShapeFilled(data: Partial<T>): data is T {
        return Object.keys(this.shape).every(key => key in data);
    }
}

export default ObjectValidator;
