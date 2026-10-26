import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {type IHandler, Router} from '@/router';
import type {IMethods, IStrictMessage} from '@/types';

const createHandler = (): IHandler => () => {};

const request = (method: string, url: string): IStrictMessage['req'] => {
    return {method, url} as IStrictMessage['req'];
};

const createRouter = (...routes: [IMethods, string, IHandler][]): Router => {
    const router = new Router();
    routes.forEach(([method, path, handler]) => router.registerRoute({method, path, handler}));
    return router;
};

describe('Router: static routes', () => {
    it('returns null when nothing is registered', () => {
        assert.equal(new Router().resolveRoute(request('GET', '/')), null);
    });

    it('matches the root route only for "/"', () => {
        const home = createHandler();
        const router = createRouter(['GET', '/', home]);
        assert.equal(router.resolveRoute(request('GET', '/'))?.handler, home);
        assert.equal(router.resolveRoute(request('GET', '/todos')), null);
    });

    it('picks the handler by method for the same path', () => {
        const getTodos = createHandler();
        const postTodos = createHandler();
        const router = createRouter(['GET', '/todos', getTodos], ['POST', '/todos', postTodos]);
        assert.equal(router.resolveRoute(request('GET', '/todos'))?.handler, getTodos);
        assert.equal(router.resolveRoute(request('POST', '/todos'))?.handler, postTodos);
    });

    it('compares methods case-sensitively', () => {
        const router = createRouter(['GET', '/todos', createHandler()]);
        assert.equal(router.resolveRoute(request('get', '/todos')), null);
    });

    it('compares paths case-sensitively', () => {
        const router = createRouter(['GET', '/todos', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/Todos')), null);
    });

    it('ignores a trailing slash', () => {
        const todos = createHandler();
        const router = createRouter(['GET', '/todos', todos]);
        assert.equal(router.resolveRoute(request('GET', '/todos/'))?.handler, todos);
    });

    it('does not match longer or shorter paths', () => {
        const router = createRouter(['GET', '/todos/new', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/todos')), null);
        assert.equal(router.resolveRoute(request('GET', '/todos/new/extra')), null);
    });

    it('ignores the query string when matching and exposes it as search', () => {
        const home = createHandler();
        const router = createRouter(['GET', '/', home]);
        const match = router.resolveRoute(request('GET', '/?page=2&page=3&q=a%20b'));
        assert.equal(match?.handler, home);
        assert.equal(match?.search.get('page'), '2');
        assert.deepEqual(match?.search.getAll('page'), ['2', '3']);
        assert.equal(match?.search.get('q'), 'a b');
    });

    it('resolves dot segments before matching', () => {
        const todos = createHandler();
        const router = createRouter(['GET', '/todos', todos]);
        assert.equal(router.resolveRoute(request('GET', '/assets/../todos'))?.handler, todos);
        assert.equal(router.resolveRoute(request('GET', '/./todos'))?.handler, todos);
        assert.equal(router.resolveRoute(request('GET', '/assets/%2e%2e/todos'))?.handler, todos);
    });

    it('the first registered route wins', () => {
        const newTodo = createHandler();
        const byId = createHandler();
        const router = createRouter(['GET', '/todos/new', newTodo], ['GET', '/todos/:id', byId]);
        assert.equal(router.resolveRoute(request('GET', '/todos/new'))?.handler, newTodo);

        const reversed = createRouter(['GET', '/todos/:id', byId], ['GET', '/todos/new', newTodo]);
        assert.equal(reversed.resolveRoute(request('GET', '/todos/new'))?.handler, byId);
    });
});

describe('Router: params', () => {
    it('extracts a param', () => {
        const router = createRouter(['POST', '/todos/:id/delete', createHandler()]);
        assert.deepEqual(router.resolveRoute(request('POST', '/todos/42/delete'))?.params, {id: '42'});
    });

    it('extracts several params', () => {
        const router = createRouter(['GET', '/users/:userId/todos/:todoId', createHandler()]);
        assert.deepEqual(router.resolveRoute(request('GET', '/users/7/todos/42'))?.params, {
            userId: '7',
            todoId: '42'
        });
    });

    it('does not let an empty segment fill a param', () => {
        const router = createRouter(['POST', '/todos/:id/delete', createHandler()]);
        assert.equal(router.resolveRoute(request('POST', '/todos//delete')), null);
        assert.equal(router.resolveRoute(request('POST', '/todos/delete')), null);
    });

    it('does not leak params from a route that matched only partially', () => {
        const edit = createHandler();
        const router = createRouter(['GET', '/a/:x/b', createHandler()], ['GET', '/a/:y/c', edit]);
        const match = router.resolveRoute(request('GET', '/a/1/c'));
        assert.equal(match?.handler, edit);
        assert.deepEqual(match?.params, {y: '1'});
    });

    it('keeps params percent-encoded', () => {
        const router = createRouter(['GET', '/todos/:id', createHandler()]);
        assert.deepEqual(router.resolveRoute(request('GET', '/todos/a%20b'))?.params, {id: 'a%20b'});
        assert.deepEqual(router.resolveRoute(request('GET', '/todos/я'))?.params, {id: '%D1%8F'});
    });

    it('returns a fresh params object on every call', () => {
        const router = createRouter(['GET', '/todos/:id', createHandler()]);
        const first = router.resolveRoute(request('GET', '/todos/1'));
        const second = router.resolveRoute(request('GET', '/todos/2'));
        assert.notEqual(first?.params, second?.params);
        assert.equal(first?.params.id, '1');
    });
});

describe('Router: wildcard', () => {
    it('passes the tail after the prefix as params["*"]', () => {
        const router = createRouter(['GET', '/assets/*', createHandler()]);
        assert.deepEqual(router.resolveRoute(request('GET', '/assets/styles/index.css'))?.params, {
            '*': 'styles/index.css'
        });
    });

    it('keeps a repeated prefix inside the tail', () => {
        const router = createRouter(['GET', '/assets/*', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/assets/a/assets/b.css'))?.params['*'], 'a/assets/b.css');
    });

    it('matches the bare prefix with an empty tail', () => {
        const router = createRouter(['GET', '/assets/*', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/assets'))?.params['*'], '');
        assert.equal(router.resolveRoute(request('GET', '/assets/'))?.params['*'], '');
    });

    it('compares whole segments, not string prefixes', () => {
        const router = createRouter(['GET', '/assets/*', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/assetsfoo/x.css')), null);
        assert.equal(router.resolveRoute(request('GET', '/asset/x.css')), null);
    });

    it('respects the method', () => {
        const router = createRouter(['GET', '/assets/*', createHandler()]);
        assert.equal(router.resolveRoute(request('POST', '/assets/x.css')), null);
    });

    it('resolves dot segments before the tail reaches the handler', () => {
        const router = createRouter(['GET', '/assets/*', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/assets/a/../b.css'))?.params['*'], 'b.css');
        assert.equal(router.resolveRoute(request('GET', '/assets/../todos')), null);
    });

    it('keeps encoded slashes and dots inside one tail segment', () => {
        const router = createRouter(['GET', '/assets/*', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/assets/..%2Fconst.ts'))?.params['*'], '..%2Fconst.ts');
    });

    it('a root wildcard matches everything', () => {
        const router = createRouter(['GET', '/*', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/'))?.params['*'], '');
        assert.equal(router.resolveRoute(request('GET', '/a/b/c'))?.params['*'], 'a/b/c');
    });

    it('a wildcard registered first shadows later specific routes', () => {
        const catchAll = createHandler();
        const router = createRouter(['GET', '/*', catchAll], ['GET', '/todos', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/todos'))?.handler, catchAll);
    });

    it('extracts params that come before the wildcard', () => {
        const router = createRouter(['GET', '/users/:userId/files/*', createHandler()]);
        assert.deepEqual(router.resolveRoute(request('GET', '/users/7/files/docs/cv.pdf'))?.params, {
            userId: '7',
            '*': 'docs/cv.pdf'
        });
    });

    it('requires every segment before the wildcard to be present', () => {
        const router = createRouter(['GET', '/users/:userId/files/*', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/users/7')), null);
        assert.equal(router.resolveRoute(request('GET', '/users')), null);
        assert.deepEqual(router.resolveRoute(request('GET', '/users/7/files'))?.params, {userId: '7', '*': ''});
    });

    it('does not match when a static segment before the wildcard differs', () => {
        const router = createRouter(['GET', '/users/:userId/files/*', createHandler()]);
        assert.equal(router.resolveRoute(request('GET', '/users/7/photos/a.png')), null);
    });

    it('falls through to later routes when the prefix does not match', () => {
        const todos = createHandler();
        const router = createRouter(['GET', '/assets/*', createHandler()], ['GET', '/todos', todos]);
        assert.equal(router.resolveRoute(request('GET', '/todos'))?.handler, todos);
    });
});

describe('Router: malformed targets', () => {
    it('returns null instead of throwing', () => {
        const router = createRouter(['GET', '/', createHandler()], ['GET', '/assets/*', createHandler()]);
        for (const url of ['//[', '//x/assets/a.svg', '/\\x/assets/a.svg', '/%', 'http://[/']) {
            assert.equal(router.resolveRoute(request('GET', url)), null, url);
        }
    });
});
