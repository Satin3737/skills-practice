import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import http, {type IncomingHttpHeaders} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {after, before, beforeEach, describe, it} from 'node:test';
import {BodyLimit} from '@/const';
import {TodoController} from '@/controllers';
import {type ITodo, TodosService} from '@/features/todos';
import AppServer from '@/server';

interface IResponse {
    status: number;
    headers: IncomingHttpHeaders;
    body: string;
}

interface IRequestOptions {
    method?: string;
    path?: string;
    headers?: Record<string, string | number>;
    body?: string;
}

const form = (data: Record<string, string>): IRequestOptions => ({
    method: 'POST',
    path: '/todos',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(data).toString()
});

describe('AppServer (HTTP)', () => {
    let dir: string;
    let file: string;
    let app: AppServer;
    let port: number;

    const send = ({
        method = 'GET',
        path: requestPath = '/',
        headers = {},
        body
    }: IRequestOptions = {}): Promise<IResponse> => {
        return new Promise((resolve, reject) => {
            const req = http.request({host: '127.0.0.1', port, method, path: requestPath, headers}, res => {
                const chunks: Buffer[] = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => {
                    resolve({
                        status: res.statusCode ?? 0,
                        headers: res.headers,
                        body: Buffer.concat(chunks).toString()
                    });
                });
            });
            req.on('error', reject);
            req.end(body);
        });
    };

    const readStored = async (): Promise<ITodo[]> =>
        (await readFile(file, 'utf8'))
            .split('\n')
            .filter(Boolean)
            .map(line => JSON.parse(line));

    before(async () => {
        dir = await mkdtemp(path.join(tmpdir(), 'app-'));
        file = path.join(dir, 'todos.jsonl');
        app = new AppServer(new TodoController(new TodosService(file)));
        port = await app.start(0);
    });

    after(async () => {
        await app.stop();
        await rm(dir, {recursive: true, force: true});
    });

    beforeEach(async () => {
        await writeFile(file, '');
    });

    describe('pages', () => {
        it('GET / renders the home page', async () => {
            const res = await send();
            assert.equal(res.status, 200);
            assert.match(String(res.headers['content-type']), /text\/html/);
            assert.ok(res.body.includes('Nothing here yet'));
        });

        it('GET /todos renders the form', async () => {
            const res = await send({path: '/todos'});
            assert.equal(res.status, 200);
            assert.ok(res.body.includes('<form action="/todos" method="post"'));
        });

        it('unknown path → 404 page', async () => {
            const res = await send({path: '/nope'});
            assert.equal(res.status, 404);
            assert.ok(res.body.includes('404'));
        });

        it('malformed or host-like request targets → 404', async () => {
            for (const target of [
                '//[',
                '//x/assets/favicon/favicon.svg',
                '///assets/favicon/favicon.svg',
                '/\\x/assets/favicon/favicon.svg',
                '/%',
                '/%zz',
                '/todos/%/delete',
                'http://[/'
            ]) {
                assert.equal((await send({path: target})).status, 404, target);
            }
        });

        it('unsupported method → 405', async () => {
            assert.equal((await send({method: 'PUT'})).status, 405);
        });

        it('any page of an empty list renders without a redirect', async () => {
            assert.equal((await send({path: '/?page=5'})).status, 200);
        });

        it('page past the end redirects to the first page', async () => {
            await send(form({title: 'Only one todo', description: 'Long enough description'}));
            const res = await send({path: '/?page=5'});
            assert.equal(res.status, 302);
            assert.equal(res.headers.location, '/');
        });

        it('invalid page number falls back to the first page', async () => {
            assert.equal((await send({path: '/?page=abc'})).status, 200);
            assert.equal((await send({path: '/?page=-1'})).status, 200);
        });
    });

    describe('creating todos', () => {
        it('valid form → 302 to home and the todo is stored', async () => {
            const res = await send(form({title: 'Learn node:test', description: 'Write HTTP tests'}));
            assert.equal(res.status, 302);
            assert.equal(res.headers.location, '/');

            const stored = await readStored();
            assert.equal(stored.length, 1);
            assert.equal(stored[0].title, 'Learn node:test');
            assert.ok((await send()).body.includes('Learn node:test'));
        });

        it('invalid form → 422 with the error and the escaped submitted value', async () => {
            const res = await send(form({title: '<b>short', description: 'Long enough description'}));
            assert.equal(res.status, 422);
            assert.ok(res.body.includes('Title must be at least 10 characters'));
            assert.ok(res.body.includes('value="&lt;b&gt;short"'));
            assert.deepEqual(await readStored(), []);
        });

        it('stored todo is rendered escaped on the home page', async () => {
            await send(form({title: '<script>alert(1)</script>', description: 'Long enough description'}));
            const {body} = await send();
            assert.ok(!body.includes('<script>alert(1)</script>'));
            assert.ok(body.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
        });

        it('body over the limit → 413 and the connection is closed', async () => {
            const {headers, ...request} = form({title: 'x', description: 'Long enough description'});
            const res = await send({...request, headers: {...headers, 'Content-Length': BodyLimit + 1}});
            assert.equal(res.status, 413);
            assert.equal(res.headers.connection, 'close');
            assert.deepEqual(await readStored(), []);
        });
    });

    describe('deleting todos', () => {
        it('deletes an existing todo and redirects', async () => {
            await send(form({title: 'Delete me please', description: 'Long enough description'}));
            const [todo] = await readStored();

            const res = await send({method: 'POST', path: `/todos/${todo.id}/delete`});
            assert.equal(res.status, 302);
            assert.deepEqual(await readStored(), []);
        });

        it('ignores an invalid id and still redirects', async () => {
            await send(form({title: 'Keep me please', description: 'Long enough description'}));

            const res = await send({method: 'POST', path: '/todos/not-a-uuid/delete'});
            assert.equal(res.status, 302);
            assert.equal((await readStored()).length, 1);
        });
    });

    describe('static files', () => {
        it('serves a file with its content type', async () => {
            const res = await send({path: '/assets/favicon/favicon.svg'});
            assert.equal(res.status, 200);
            assert.equal(res.headers['content-type'], 'image/svg+xml');
        });

        it('serves several static roots', async () => {
            const res = await send({path: '/docs/test.txt'});
            assert.equal(res.status, 200);
            assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
        });

        it('serves a file with spaces and Cyrillic in its name', async () => {
            const res = await send({path: encodeURI('/docs/с пробелом.txt')});
            assert.equal(res.status, 200);
            assert.equal(res.body, 'туц-туц-туц\n');
        });

        it('serves a file from a Cyrillic directory with spaces', async () => {
            const res = await send({path: encodeURI('/docs/папка А Б В/вложенный с пробелом.txt')});
            assert.equal(res.status, 200);
        });

        it('malformed percent-encoding in a static path → 404', async () => {
            for (const target of ['/assets/%', '/assets/%E0%A4%A', '/assets/%00']) {
                assert.equal((await send({path: target})).status, 404, target);
            }
        });

        it('missing file → 404', async () => {
            assert.equal((await send({path: '/assets/missing.css'})).status, 404);
        });

        it('the static root itself → 403', async () => {
            assert.equal((await send({path: '/assets/'})).status, 403);
        });

        it('does not leak files outside the static root', async () => {
            const expected: Record<string, number> = {
                '/assets/../../const.ts': 404,
                '/assets/%2e%2e/%2e%2e/const.ts': 404,
                '/assets/..%2F..%2Fconst.ts': 403,
                '/assets/%2e%2e%2fconst.ts': 403
            };

            for (const [traversal, status] of Object.entries(expected)) {
                const res = await send({path: traversal});
                assert.equal(res.status, status, traversal);
                assert.ok(!res.body.includes('export const'), traversal);
            }
        });
    });

    describe('errors', () => {
        it('broken storage → 500 with a generic message and no internal paths', async t => {
            t.mock.method(console, 'error', () => {});
            await writeFile(file, '{"not": "a todo"}\n');

            const res = await send();
            assert.equal(res.status, 500);
            assert.ok(res.body.includes('Internal Server Error'));
            assert.ok(!res.body.includes(dir));
        });
    });

    describe('errors after headers are sent', () => {
        it('aborts the connection instead of leaving the response open', async t => {
            t.mock.method(console, 'error', () => {});
            const failing = new TodoController(new TodosService(file));
            failing.homeTodoHandler = async (_, res) => {
                res.writeHead(200);
                res.write('partial');
                throw new Error('boom');
            };
            const broken = new AppServer(failing);
            const brokenPort = await broken.start(0);

            try {
                const outcome = await new Promise<string>(resolve => {
                    setTimeout(() => resolve('hung'), 1000).unref();
                    const req = http.get({host: '127.0.0.1', port: brokenPort, path: '/'}, res => {
                        res.on('error', () => resolve('aborted'));
                        res.on('close', () => resolve(res.complete ? 'completed' : 'aborted'));
                        res.resume();
                    });
                    req.on('error', () => resolve('aborted'));
                });
                assert.equal(outcome, 'aborted');
            } finally {
                await broken.stop();
            }
        });
    });
});
