import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import type {ITodo} from '@/features/todos';
import {getHomePage, getNewTodoPage, getNotFoundPage, getServerErrorPage} from '@/templates';

const XSS = '<script>alert("x")</script>';

const createTodo = (overrides: Partial<ITodo> = {}): ITodo => ({
    id: crypto.randomUUID(),
    title: 'Learn Node streams',
    description: 'Readable, writable, pipeline',
    createdAt: new Date().toISOString(),
    ...overrides
});

describe('getHomePage', () => {
    it('escapes todo title and description', () => {
        const html = getHomePage([createTodo({title: XSS, description: XSS})], 1, 1);
        assert.ok(!html.includes('<script>'));
        assert.ok(html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'));
    });

    it('renders the delete form for each todo', () => {
        const todo = createTodo();
        assert.ok(getHomePage([todo], 1, 1).includes(`action="/todos/${todo.id}/delete"`));
    });

    it('shows the empty state when there are no todos', () => {
        assert.ok(getHomePage([], 1, 0).includes('Nothing here yet'));
    });

    it('hides pagination for zero or one page', () => {
        assert.ok(!getHomePage([], 1, 0).includes('class="pagination"'));
        assert.ok(!getHomePage([createTodo()], 1, 1).includes('class="pagination"'));
    });

    it('renders links for other pages and marks the current one', () => {
        const html = getHomePage([createTodo()], 2, 3);
        assert.ok(html.includes('href="/?page=1"'));
        assert.ok(html.includes('href="/?page=3"'));
        assert.ok(!html.includes('href="/?page=2"'));
        assert.ok(html.includes('<div class="pagination-current">2</div>'));
    });
});

describe('getNewTodoPage', () => {
    it('renders an empty form', () => {
        const html = getNewTodoPage();
        assert.ok(html.includes('value=""'));
        assert.ok(html.includes('<form action="/todos" method="post"'));
    });

    it('escapes previously submitted values so they cannot break out of the attribute', () => {
        const html = getNewTodoPage({title: '" autofocus onfocus="alert(1)', description: `</textarea>${XSS}`});
        assert.ok(html.includes('value="&quot; autofocus onfocus=&quot;alert(1)"'));
        assert.ok(!html.includes('</textarea><script>'));
    });

    it('renders escaped error messages', () => {
        const html = getNewTodoPage({}, {title: 'Title is required', description: '<b>bad</b>'});
        assert.ok(html.includes('<span class="error">Title is required</span>'));
        assert.ok(html.includes('&lt;b&gt;bad&lt;/b&gt;'));
    });
});

describe('error pages', () => {
    it('not found page shows 404', () => {
        assert.ok(getNotFoundPage().includes('404'));
    });

    it('server error page shows the status and an escaped message', () => {
        const html = getServerErrorPage(413, XSS);
        assert.ok(html.includes('413'));
        assert.ok(!html.includes('<script>'));
    });

    it('uses a different title for client and server errors', () => {
        assert.ok(getServerErrorPage(413, 'x').includes('<h1 class="title">Error</h1>'));
        assert.ok(getServerErrorPage(500, 'x').includes('<h1 class="title">Server Error</h1>'));
    });
});
