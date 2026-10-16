import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {NumberValidator, ObjectValidator, StringValidator} from '@/validator';

describe('StringValidator', () => {
    it('accepts any string when there are no checks', () => {
        assert.deepEqual(new StringValidator().validate(''), {valid: true, data: ''});
    });

    it('rejects non-strings with the default type message', () => {
        for (const value of [undefined, null, 42, {}, [], true]) {
            assert.deepEqual(new StringValidator().validate(value), {valid: false, errors: ['Must be a string']});
        }
    });

    it('uses a custom type message', () => {
        assert.deepEqual(new StringValidator('Title must be a string').validate(1), {
            valid: false,
            errors: ['Title must be a string']
        });
    });

    it('falls back to its own default type message for an empty custom message', () => {
        assert.deepEqual(new StringValidator('').validate(1), {valid: false, errors: ['Must be a string']});
        assert.deepEqual(new NumberValidator('').validate('1'), {valid: false, errors: ['Must be a number']});
        assert.deepEqual(new ObjectValidator<{a: string}>({a: new StringValidator()}, '').validate(null), {
            valid: false,
            errors: ['Must be an object'],
            innerErrors: {}
        });
    });

    it('min / max are inclusive', () => {
        const validator = new StringValidator().min(3).max(5);
        assert.equal(validator.validate('ab').valid, false);
        assert.equal(validator.validate('abc').valid, true);
        assert.equal(validator.validate('abcde').valid, true);
        assert.equal(validator.validate('abcdef').valid, false);
    });

    it('uses default messages for min / max', () => {
        assert.deepEqual(new StringValidator().min(3).validate('a'), {
            valid: false,
            errors: ['Must be at least 3 characters long']
        });
        assert.deepEqual(new StringValidator().max(1).validate('ab'), {
            valid: false,
            errors: ['Must be at most 1 characters long']
        });
    });

    it('notEmpty rejects whitespace-only strings but keeps surrounding spaces in data', () => {
        const validator = new StringValidator().notEmpty();
        assert.deepEqual(validator.validate('   \n\t'), {valid: false, errors: ['Cannot be empty']});
        assert.deepEqual(validator.validate('  a  '), {valid: true, data: '  a  '});
    });

    it('min counts whitespace, so it does not replace notEmpty', () => {
        assert.equal(new StringValidator().min(3).validate('   ').valid, true);
    });

    it('uuid accepts lower and upper case and rejects anything else', () => {
        const validator = new StringValidator().uuid();
        const id = crypto.randomUUID();
        assert.equal(validator.validate(id).valid, true);
        assert.equal(validator.validate(id.toUpperCase()).valid, true);

        for (const value of ['', 'not-a-uuid', `${id}x`, ` ${id}`, id.replaceAll('-', ''), '../../etc/passwd']) {
            assert.equal(validator.validate(value).valid, false, value);
        }
    });

    it('collects every failed check in declaration order', () => {
        const validator = new StringValidator().notEmpty('empty').min(2, 'short').uuid('uuid');
        assert.deepEqual(validator.validate(''), {valid: false, errors: ['empty', 'short', 'uuid']});
    });

    it('skips value checks when the type is wrong', () => {
        const validator = new StringValidator('type').notEmpty('empty').min(2, 'short');
        assert.deepEqual(validator.validate(undefined), {valid: false, errors: ['type']});
    });

    it('chain methods return the same instance', () => {
        const validator = new StringValidator();
        assert.equal(validator.min(1), validator);
        assert.equal(validator.max(10).notEmpty().uuid(), validator);
    });

    it('counts length in UTF-16 code units', () => {
        assert.equal(new StringValidator().max(5).validate('привет').valid, false);
        assert.equal(new StringValidator().max(1).validate('😀').valid, false);
    });
});

describe('NumberValidator', () => {
    it('rejects non-numbers, including numeric strings', () => {
        for (const value of ['1', undefined, null, {}, 1n]) {
            assert.deepEqual(new NumberValidator().validate(value), {valid: false, errors: ['Must be a number']});
        }
    });

    it('integer rejects fractions, NaN and Infinity', () => {
        const validator = new NumberValidator().integer();
        assert.equal(validator.validate(3).valid, true);
        assert.equal(validator.validate(-3).valid, true);
        assert.equal(validator.validate(3.0).valid, true);

        for (const value of [1.5, NaN, Infinity, -Infinity]) {
            assert.deepEqual(validator.validate(value), {valid: false, errors: ['Must be an integer']}, String(value));
        }
    });

    it('min is inclusive and fails for NaN', () => {
        const validator = new NumberValidator().min(1);
        assert.equal(validator.validate(1).valid, true);
        assert.equal(validator.validate(0.999).valid, false);
        assert.deepEqual(validator.validate(NaN), {valid: false, errors: ['Must be greater than or equal to 1']});
    });
});

describe('ObjectValidator', () => {
    interface IUser {
        name: string;
        age: number;
    }

    const userValidator = new ObjectValidator<IUser>({
        name: new StringValidator('name type').notEmpty('name empty'),
        age: new NumberValidator('age type').integer('age int')
    });

    it('returns validated data', () => {
        assert.deepEqual(userValidator.validate({name: 'Ann', age: 30}), {valid: true, data: {name: 'Ann', age: 30}});
    });

    it('rejects non-plain-object values with the type message and no inner errors', () => {
        for (const value of [null, undefined, [], 'str', 1]) {
            assert.deepEqual(userValidator.validate(value), {
                valid: false,
                errors: ['Must be an object'],
                innerErrors: {}
            });
        }
    });

    it('reports errors per field and omits valid fields', () => {
        assert.deepEqual(userValidator.validate({name: ' ', age: 30}), {
            valid: false,
            errors: ['name: name empty'],
            innerErrors: {name: ['name empty']}
        });
    });

    it('reports a missing field as a type error of that field', () => {
        assert.deepEqual(userValidator.validate({name: 'Ann'}), {
            valid: false,
            errors: ['age: age type'],
            innerErrors: {age: ['age type']}
        });
    });

    it('reports every invalid field at once', () => {
        const result = userValidator.validate({});
        assert.equal(result.valid, false);
        if (!result.valid) assert.deepEqual(Object.keys(result.innerErrors).sort(), ['age', 'name']);
    });

    it('strips keys that are not in the shape', () => {
        const result = userValidator.validate({name: 'Ann', age: 30, isAdmin: true});
        assert.deepEqual(result, {valid: true, data: {name: 'Ann', age: 30}});
    });

    it('does not mutate the input object', () => {
        const input = {name: 'Ann', age: 30, extra: 1};
        userValidator.validate(input);
        assert.deepEqual(input, {name: 'Ann', age: 30, extra: 1});
    });

    it('keeps the errors of a nested object validator', () => {
        interface IAddress {
            city: string;
            zip: string;
        }

        const validator = new ObjectValidator<{name: string; address: IAddress}>({
            name: new StringValidator(),
            address: new ObjectValidator<IAddress>({
                city: new StringValidator('city type'),
                zip: new StringValidator().min(5, 'zip short')
            })
        });

        assert.deepEqual(validator.validate({name: 'Ann', address: {zip: '1'}}), {
            valid: false,
            errors: ['address: city: city type', 'address: zip: zip short'],
            innerErrors: {address: ['city: city type', 'zip: zip short']}
        });
        assert.deepEqual(validator.validate({name: 'Ann', address: 'Kyiv'}), {
            valid: false,
            errors: ['address: Must be an object'],
            innerErrors: {address: ['Must be an object']}
        });
        assert.deepEqual(validator.validate({name: 'Ann', address: {city: 'Kyiv', zip: '01001', extra: 1}}), {
            valid: true,
            data: {name: 'Ann', address: {city: 'Kyiv', zip: '01001'}}
        });
    });

    it('uses a custom type message', () => {
        const validator = new ObjectValidator<{a: string}>({a: new StringValidator()}, 'Body must be an object');
        assert.deepEqual(validator.validate(null), {valid: false, errors: ['Body must be an object'], innerErrors: {}});
    });
});
