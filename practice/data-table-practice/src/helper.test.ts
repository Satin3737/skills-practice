import {describe, expect, it} from 'vitest';
import {getRequestParamsString, getTotalPages, isLimit} from './helper';

describe('isLimit', () => {
    it.each([5, 10, 15, 20, 25])('accepts %i', value => {
        expect(isLimit(value)).toBe(true);
    });

    it.each([0, 1, 7, 30, -5, NaN])('rejects %s', value => {
        expect(isLimit(value)).toBe(false);
    });
});

describe('getRequestParamsString', () => {
    it('returns an empty string for no params', () => {
        expect(getRequestParamsString({})).toBe('');
    });

    it('maps params to json-server query names', () => {
        const result = getRequestParamsString<{name: string}>({
            page: 2,
            limit: 10,
            sort: 'name',
            search: 'john',
            order: 'desc'
        });
        expect(Object.fromEntries(new URLSearchParams(result))).toEqual({
            _page: '2',
            _limit: '10',
            _sort: 'name',
            q: 'john',
            _order: 'desc'
        });
    });

    it('omits undefined params but keeps falsy defined ones', () => {
        const result = new URLSearchParams(getRequestParamsString({page: 1, search: ''}));
        expect([...result.keys()].sort()).toEqual(['_page', 'q']);
        expect(result.get('q')).toBe('');
    });

    it('url-encodes the search term', () => {
        expect(getRequestParamsString({search: 'a b&c'})).toBe('q=a+b%26c');
    });
});

describe('getTotalPages', () => {
    it('divides the total by the limit and rounds up', () => {
        expect(getTotalPages('100', 10)).toBe(10);
        expect(getTotalPages('101', 10)).toBe(11);
        expect(getTotalPages('1', 25)).toBe(1);
    });

    it('defaults the limit to 5', () => {
        expect(getTotalPages('11')).toBe(3);
    });

    it('returns 0 for a missing, zero or non-numeric header', () => {
        expect(getTotalPages(null)).toBe(0);
        expect(getTotalPages('0')).toBe(0);
        expect(getTotalPages('abc')).toBe(0);
    });
});
