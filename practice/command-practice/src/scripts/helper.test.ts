import {beforeEach, describe, expect, it} from 'vitest';
import {queryOrThrow} from './helper';

describe('queryOrThrow', () => {
    beforeEach(() => {
        document.body.innerHTML = '<h1 data-title>Hi</h1>';
    });

    it('returns the matching element', () => {
        expect(queryOrThrow<HTMLHeadingElement>('[data-title]').textContent).toBe('Hi');
    });

    it('throws with the selector when nothing matches', () => {
        expect(() => queryOrThrow('[data-missing]')).toThrow('Element not found: [data-missing]');
    });
});
