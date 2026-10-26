import {beforeEach, describe, expect, it} from 'vitest';
import App from './App';

const html = `
    <button data-action="increment"></button>
    <button data-action="decrement"></button>
    <button data-action="reset"></button>
    <input data-action="input" />
    <button data-action="set"></button>
    <h2 data-counter>0</h2>
    <button data-action="undo"></button>
    <button data-action="redo"></button>
`;

const $ = <T extends HTMLElement>(selector: string): T => document.querySelector<T>(selector)!;
const click = (action: string): void => $(`[data-action="${action}"]`).click();
const counter = (): string => $('[data-counter]').textContent!;
const type = (value: string): void => {
    const input = $<HTMLInputElement>('[data-action="input"]');
    input.value = value;
    input.dispatchEvent(new Event('input', {bubbles: true}));
};
const key = (init: KeyboardEventInit): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', {bubbles: true, cancelable: true, ...init});
    document.dispatchEvent(event);
    return event;
};

describe('App', () => {
    beforeEach(() => {
        document.body.innerHTML = html;
        new App();
    });

    it('throws when required markup is missing', () => {
        document.body.innerHTML = '';
        expect(() => new App()).toThrow('Element not found');
    });

    it('renders 0 with undo and redo disabled', () => {
        expect(counter()).toBe('0');
        expect($<HTMLButtonElement>('[data-action="undo"]').disabled).toBe(true);
        expect($<HTMLButtonElement>('[data-action="redo"]').disabled).toBe(true);
    });

    it('increment, decrement and reset buttons update the display', () => {
        click('increment');
        click('increment');
        expect(counter()).toBe('2');
        click('decrement');
        expect(counter()).toBe('1');
        click('reset');
        expect(counter()).toBe('0');
    });

    it('ignores clicks on non-action elements', () => {
        document.body.click();
        expect(counter()).toBe('0');
    });

    it('undo/redo buttons revert and reapply and toggle disabled states', () => {
        click('increment');
        expect($<HTMLButtonElement>('[data-action="undo"]').disabled).toBe(false);

        click('undo');
        expect(counter()).toBe('0');
        expect($<HTMLButtonElement>('[data-action="undo"]').disabled).toBe(true);
        expect($<HTMLButtonElement>('[data-action="redo"]').disabled).toBe(false);

        click('redo');
        expect(counter()).toBe('1');
        expect($<HTMLButtonElement>('[data-action="redo"]').disabled).toBe(true);
    });

    describe('input', () => {
        it.each([
            ['12abc3', '123'],
            ['-5', '-5'],
            ['5-', '5'],
            ['--5', '-5'],
            ['a-b', '']
        ])('sanitizes %j to %j', (raw, expected) => {
            type(raw);
            expect($<HTMLInputElement>('[data-action="input"]').value).toBe(expected);
        });

        it('Set applies the value and clears the field', () => {
            type('-15');
            click('set');
            expect(counter()).toBe('-15');
            expect($<HTMLInputElement>('[data-action="input"]').value).toBe('');
        });

        it('Set with a lone minus sign does nothing and keeps the field', () => {
            type('-');
            click('set');
            expect(counter()).toBe('0');
            expect($<HTMLInputElement>('[data-action="input"]').value).toBe('-');
            expect($<HTMLButtonElement>('[data-action="undo"]').disabled).toBe(true);
        });

        it('Enter submits only while the input is focused', () => {
            const input = $<HTMLInputElement>('[data-action="input"]');
            type('9');
            key({key: 'Enter'});
            expect(counter()).toBe('0');

            input.focus();
            const event = key({key: 'Enter'});
            expect(event.defaultPrevented).toBe(true);
            expect(counter()).toBe('9');
        });
    });

    describe('keyboard shortcuts', () => {
        it('Ctrl+Z undoes and Ctrl+Y redoes', () => {
            click('increment');
            expect(key({key: 'z', ctrlKey: true}).defaultPrevented).toBe(true);
            expect(counter()).toBe('0');
            expect(key({key: 'y', ctrlKey: true}).defaultPrevented).toBe(true);
            expect(counter()).toBe('1');
        });

        it('Meta key works like Ctrl', () => {
            click('increment');
            key({key: 'z', metaKey: true});
            expect(counter()).toBe('0');
        });

        it('plain z/y without a modifier do nothing', () => {
            click('increment');
            key({key: 'z'});
            expect(counter()).toBe('1');
        });
    });
});
