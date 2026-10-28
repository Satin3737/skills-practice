import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import $ from 'jquery';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import FormHandler from './form';

const html = readFileSync(resolve(import.meta.dirname, '../../index.html'), 'utf8');
const main = html.match(/<main>[\s\S]*<\/main>/)![0];

const $form = (): JQuery<HTMLFormElement> => $('[data-form]');
const submit = (): void => {
    $form()[0].dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
};
const fill = (name: string, value: string): void => {
    const el = $form().find(`[name="${name}"]`)[0] as HTMLInputElement;
    el.value = value;
    el.dispatchEvent(new Event('input', {bubbles: true}));
};
const check = (selector: string): void => {
    const el = $form().find(selector)[0] as HTMLInputElement;
    el.checked = true;
    el.dispatchEvent(new Event('change', {bubbles: true}));
};
const fillValid = (): void => {
    fill('name', 'John');
    fill('surname', 'Doe');
    fill('age', '30');
    fill('email', 'john@example.com');
    fill('comment', 'A comment long enough');
    check('[name="color"][value="green"]');
    check('[name="best"]');
    check('[name="sad"]');
};
const errorText = (selector: string): string => $form().find(selector).text();
const submitBtn = (): HTMLButtonElement => $form().find('.submit')[0] as HTMLButtonElement;
const mockFetch = (response: Promise<Response>) => {
    const spy = vi.fn((_url: string, _init: RequestInit) => response);
    vi.stubGlobal('fetch', spy);
    return spy;
};
const json = (body: unknown, status = 200): Promise<Response> =>
    Promise.resolve(new Response(JSON.stringify(body), {status}));

describe('FormHandler', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        document.body.innerHTML = main;
        new FormHandler($form());
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('validation', () => {
        it('shows an error for every field of an empty form and does not submit', () => {
            const spy = mockFetch(json({}));
            submit();

            expect(errorText('.field:has([name="name"]) .error')).toMatch(/at least 2/);
            expect(errorText('.field:has([name="surname"]) .error')).toMatch(/at least 2/);
            expect(errorText('.field:has([name="age"]) .error')).toMatch(/too young/);
            expect(errorText('.field:has([name="email"]) .error')).toBe('Email invalid');
            expect(errorText('.radio-group .error')).toBe('Color is required');
            expect(errorText('.checkbox-group .error')).toBe('Select at least one option');
            expect(errorText('.field:has([name="comment"]) .error')).toMatch(/at least 10/);
            expect(spy).not.toHaveBeenCalled();
            expect(submitBtn().disabled).toBe(false);
        });

        it('prevents the native submit', () => {
            const event = new Event('submit', {bubbles: true, cancelable: true});
            $form()[0].dispatchEvent(event);
            expect(event.defaultPrevented).toBe(true);
        });

        it('typing clears only that field error', () => {
            submit();
            fill('name', 'J');
            expect(errorText('.field:has([name="name"]) .error')).toBe('');
            expect(errorText('.field:has([name="surname"]) .error')).not.toBe('');
        });

        it('changing the radio group clears its error only', () => {
            submit();
            check('[name="color"][value="red"]');
            expect(errorText('.radio-group .error')).toBe('');
            expect(errorText('.checkbox-group .error')).not.toBe('');
        });

        it('changing a checkbox clears the checkbox group error only', () => {
            submit();
            check('[name="rock"]');
            expect(errorText('.checkbox-group .error')).toBe('');
            expect(errorText('.radio-group .error')).not.toBe('');
        });

        it('re-submit clears previous errors once data becomes valid', () => {
            submit();
            fillValid();
            mockFetch(json({}));
            submit();
            expect($form().find('.error').filter((_, el) => el.textContent !== '')).toHaveLength(0);
        });
    });

    describe('submission', () => {
        it('posts parsed data as JSON', () => {
            const spy = mockFetch(json({}));
            fillValid();
            submit();

            const [url, init] = spy.mock.calls[0];
            expect(url).toBe('https://httpbin.org/post');
            expect(init.method).toBe('POST');
            expect(JSON.parse(String(init.body))).toEqual({
                name: 'John',
                surname: 'Doe',
                age: 30,
                email: 'john@example.com',
                color: 'green',
                preferences: ['best', 'sad'],
                comment: 'A comment long enough'
            });
            expect(init.signal).toBeInstanceOf(AbortSignal);
        });

        it.each([
            ['invalid', 'https://httpbin.org/status/422'],
            ['delay', 'https://httpbin.org/delay/3']
        ])('the %s submit button posts to its url and shows loading only on itself', (type, url) => {
            const spy = mockFetch(new Promise(() => {}));
            fillValid();
            const btn = $form().find(`[data-submit="${type}"]`)[0];
            $form()[0].dispatchEvent(new SubmitEvent('submit', {bubbles: true, cancelable: true, submitter: btn}));

            expect(spy.mock.calls[0][0]).toBe(url);
            expect(btn.classList.contains('_loading')).toBe(true);
            expect(submitBtn().classList.contains('_loading')).toBe(false);
            expect(submitBtn().disabled).toBe(true);
        });

        it('shows loading, then resets the form and shows success for 3s', async () => {
            const {promise, resolve} = Promise.withResolvers<Response>();
            mockFetch(promise);
            fillValid();
            submit();

            expect(submitBtn().disabled).toBe(true);
            expect(submitBtn().classList.contains('_loading')).toBe(true);

            resolve(new Response('{}'));
            await vi.advanceTimersByTimeAsync(0);

            expect(submitBtn().disabled).toBe(false);
            expect(submitBtn().classList.contains('_loading')).toBe(false);
            expect(($form().find('[name="name"]')[0] as HTMLInputElement).value).toBe('');
            expect(($form().find('[name="best"]')[0] as HTMLInputElement).checked).toBe(false);
            expect($('[data-response="success"]').hasClass('_show')).toBe(true);
            expect($('[data-response="error"]').hasClass('_show')).toBe(false);

            await vi.advanceTimersByTimeAsync(3000);
            expect($('[data-response="success"]').hasClass('_show')).toBe(false);
        });

        it('shows server validation errors next to the fields and keeps the data', async () => {
            mockFetch(json({errors: [{path: ['email'], message: 'Email is already taken'}]}, 422));
            fillValid();
            submit();
            await vi.advanceTimersByTimeAsync(0);

            expect(errorText('.field:has([name="email"]) .error')).toBe('Email is already taken');
            expect(($form().find('[name="email"]')[0] as HTMLInputElement).value).toBe('john@example.com');
            expect($('[data-response="success"]').hasClass('_show')).toBe(false);
            expect($('[data-response="error"]').hasClass('_show')).toBe(false);
            expect(submitBtn().disabled).toBe(false);
        });

        it.each([
            ['server error', () => json({}, 500)],
            ['network error or timeout', () => Promise.reject(new DOMException('timeout', 'TimeoutError'))]
        ])('on %s keeps the data, shows the error response and re-enables the button', async (_, response) => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockFetch(response());
            fillValid();
            submit();
            await vi.advanceTimersByTimeAsync(0);

            expect(consoleError).toHaveBeenCalled();
            expect(($form().find('[name="name"]')[0] as HTMLInputElement).value).toBe('John');
            expect($('[data-response="error"]').hasClass('_show')).toBe(true);
            expect($('[data-response="success"]').hasClass('_show')).toBe(false);
            expect(submitBtn().disabled).toBe(false);
        });
    });
});
