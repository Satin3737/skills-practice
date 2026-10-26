import {describe, expect, it} from 'vitest';
import formSchema from './schema';

const valid = {
    name: 'John',
    surname: 'Doe',
    age: 30,
    email: 'john@example.com',
    color: 'red',
    preferences: ['best'],
    comment: 'A comment long enough'
};

const messageFor = (patch: Record<string, unknown>, field: string): string | undefined => {
    const result = formSchema.safeParse({...valid, ...patch});
    return result.error?.issues.find(issue => issue.path[0] === field)?.message;
};

describe('formSchema', () => {
    it('accepts valid data', () => {
        expect(formSchema.safeParse(valid).success).toBe(true);
    });

    it('coerces age from a numeric string', () => {
        expect(formSchema.parse({...valid, age: '42'}).age).toBe(42);
    });

    it('reports one issue per invalid field', () => {
        const result = formSchema.safeParse({
            name: '',
            surname: '',
            age: 0,
            email: '',
            color: '',
            preferences: [],
            comment: ''
        });
        const fields = result.error?.issues.map(issue => issue.path[0]);
        expect(fields).toEqual(['name', 'surname', 'age', 'email', 'color', 'preferences', 'comment']);
    });

    it.each(['name', 'surname'])('%s length boundaries', field => {
        expect(messageFor({[field]: 'a'}, field)).toMatch(/at least 2/);
        expect(messageFor({[field]: 'ab'}, field)).toBeUndefined();
        expect(messageFor({[field]: 'a'.repeat(120)}, field)).toBeUndefined();
        expect(messageFor({[field]: 'a'.repeat(121)}, field)).toMatch(/no longer than 120/);
    });

    it('requires name and surname to be strings', () => {
        expect(messageFor({name: undefined}, 'name')).toBe('Name is required');
        expect(messageFor({surname: undefined}, 'surname')).toBe('Surname is required');
    });

    it('age boundaries are 18..100 inclusive', () => {
        expect(messageFor({age: 17}, 'age')).toMatch(/too young/);
        expect(messageFor({age: 18}, 'age')).toBeUndefined();
        expect(messageFor({age: 100}, 'age')).toBeUndefined();
        expect(messageFor({age: 101}, 'age')).toMatch(/too old/);
    });

    it('rejects a non-numeric age', () => {
        expect(messageFor({age: 'abc'}, 'age')).toBe('Age is required');
    });

    it('validates email', () => {
        expect(messageFor({email: 'nope'}, 'email')).toBe('Email invalid');
        expect(messageFor({email: 'a@b.co'}, 'email')).toBeUndefined();
    });

    it('accepts only known colors', () => {
        for (const color of ['red', 'green', 'yellow']) expect(messageFor({color}, 'color')).toBeUndefined();
        expect(messageFor({color: 'blue'}, 'color')).toBe('Color is required');
    });

    it('requires at least one known preference', () => {
        expect(messageFor({preferences: []}, 'preferences')).toBe('Select at least one option');
        expect(messageFor({preferences: ['rock', 'sad']}, 'preferences')).toBeUndefined();
        expect(messageFor({preferences: ['unknown']}, 'preferences')).toBeDefined();
    });

    it('comment length boundaries', () => {
        expect(messageFor({comment: 'a'.repeat(9)}, 'comment')).toMatch(/at least 10/);
        expect(messageFor({comment: 'a'.repeat(10)}, 'comment')).toBeUndefined();
        expect(messageFor({comment: 'a'.repeat(240)}, 'comment')).toBeUndefined();
        expect(messageFor({comment: 'a'.repeat(241)}, 'comment')).toMatch(/no longer than 240/);
    });
});
