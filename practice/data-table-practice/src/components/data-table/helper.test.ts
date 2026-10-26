import {describe, expect, it} from 'vitest';
import {getKey, getValue} from './helper';

describe('getKey', () => {
    it('passes strings and numbers through', () => {
        expect(getKey('id')).toBe('id');
        expect(getKey(0)).toBe(0);
        expect(getKey(7)).toBe(7);
    });

    it('returns null for symbols', () => {
        expect(getKey(Symbol('x'))).toBeNull();
    });

    it.each([true, {}, [], null, undefined])('returns undefined for %j', value => {
        expect(getKey(value)).toBeUndefined();
    });
});

describe('getValue', () => {
    it('passes strings and numbers through, including falsy ones', () => {
        expect(getValue('text')).toBe('text');
        expect(getValue('')).toBe('');
        expect(getValue(0)).toBe(0);
    });

    it('returns null for null and undefined', () => {
        expect(getValue(null)).toBeNull();
        expect(getValue(undefined)).toBeNull();
    });

    it('stringifies everything else', () => {
        expect(getValue(true)).toBe('true');
        expect(getValue([1, 2])).toBe('1,2');
        expect(getValue({})).toBe('[object Object]');
    });
});
