import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {describe, it} from 'node:test';
import {BodyTooBigError} from '@/errors';
import {escapeHtml, getExtname, parseBody, parseUrl} from '@/helpers';
import type {IMessage} from '@/types';

const fakeRequest = (chunks: (string | Buffer)[], headers: Record<string, string> = {}): IMessage['req'] => {
    const stream = Readable.from(chunks.map(chunk => Buffer.from(chunk)));
    return Object.assign(stream, {headers}) as unknown as IMessage['req'];
};

describe('escapeHtml', () => {
    it('escapes all five special characters', () => {
        assert.equal(
            escapeHtml(`<a href="x" title='y'>&</a>`),
            '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
        );
    });

    it('escapes "&" first, so existing entities are escaped exactly once', () => {
        assert.equal(escapeHtml('&lt;'), '&amp;lt;');
    });

    it('leaves safe text untouched', () => {
        assert.equal(escapeHtml('Hello world 123'), 'Hello world 123');
        assert.equal(escapeHtml(''), '');
    });

    it('neutralizes an attribute break-out payload', () => {
        assert.equal(escapeHtml('" onfocus="alert(1)'), '&quot; onfocus=&quot;alert(1)');
    });
});

describe('parseUrl', () => {
    it('splits pathname and search params', () => {
        const {url, search} = parseUrl('/todos?page=2')!;
        assert.equal(url, '/todos');
        assert.equal(search.get('page'), '2');
    });

    it('normalizes dot segments', () => {
        assert.equal(parseUrl('/assets/../const.ts')?.url, '/const.ts');
        assert.equal(parseUrl('/assets/%2e%2e/const.ts')?.url, '/const.ts');
    });

    it('keeps the path percent-encoded and encodes non-ASCII', () => {
        assert.equal(parseUrl('/a%20b')?.url, '/a%20b');
        assert.equal(parseUrl('/я')?.url, '/%D1%8F');
    });

    it('returns null for host-like or malformed targets', () => {
        for (const target of ['//[', '//x/a', '///a', '/\\x/a', '\\\\x/a', 'http://[/']) {
            assert.equal(parseUrl(target), null, target);
        }
    });

    it('takes only the path from an absolute-form request target', () => {
        assert.equal(parseUrl('http://evil.example/todos?x=1')?.url, '/todos');
    });
});

describe('getExtname', () => {
    it('returns a lower-cased extension', () => {
        assert.equal(getExtname('/a/b/STYLE.CSS'), '.css');
        assert.equal(getExtname('archive.tar.gz'), '.gz');
    });

    it('returns an empty string when there is no extension', () => {
        assert.equal(getExtname('/a/Makefile'), '');
        assert.equal(getExtname('/a/.env'), '');
    });
});

describe('parseBody', () => {
    it('parses an urlencoded form', async () => {
        const body = await parseBody(fakeRequest(['title=Hello+world&description=a%26b%3Dc']));
        assert.deepEqual(body, {title: 'Hello world', description: 'a&b=c'});
    });

    it('returns an empty object for an empty body', async () => {
        assert.deepEqual(await parseBody(fakeRequest([])), {});
    });

    it('keeps the last value of a repeated key', async () => {
        assert.deepEqual(await parseBody(fakeRequest(['title=first&title=second'])), {title: 'second'});
    });

    it('decodes a multibyte character split between chunks', async () => {
        const raw = Buffer.from('title=привет', 'utf8');
        const middleOfLetter = raw.length - 1;
        const body = await parseBody(fakeRequest([raw.subarray(0, middleOfLetter), raw.subarray(middleOfLetter)]));
        assert.deepEqual(body, {title: 'привет'});
    });

    it('accepts a body exactly at the limit', async () => {
        const body = await parseBody(fakeRequest(['a=12345']), 7);
        assert.deepEqual(body, {a: '12345'});
    });

    it('rejects by Content-Length before reading the body', async () => {
        await assert.rejects(parseBody(fakeRequest(['a=1'], {'content-length': '1000'}), 100), BodyTooBigError);
    });

    it('rejects a body that grows past the limit without Content-Length', async () => {
        const chunks = Array.from({length: 10}, () => 'a'.repeat(50));
        await assert.rejects(parseBody(fakeRequest(chunks), 100), BodyTooBigError);
    });

    it('rejects with status 413', async () => {
        await assert.rejects(parseBody(fakeRequest(['a'.repeat(10)]), 5), (error: BodyTooBigError) => {
            assert.equal(error.status, 413);
            return true;
        });
    });

    it('rejects when the request stream fails', async () => {
        const failing = new Readable({
            read() {
                this.destroy(new Error('socket hang up'));
            }
        });
        const req = Object.assign(failing, {headers: {}}) as unknown as IMessage['req'];
        await assert.rejects(parseBody(req), /socket hang up/);
    });
});
