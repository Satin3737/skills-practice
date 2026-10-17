import assert from 'node:assert/strict';
import {chmod, mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';
import {DataBrokenError, FileOperationError} from '@/errors';
import {type ITodo, TodosService} from '@/features/todos';

const newTodo = (n: number) => ({title: `Todo title ${n}`, description: `Description ${n}`});

const storedTodo = (n: number, createdAt: string): ITodo => ({
    id: crypto.randomUUID(),
    title: `Stored ${n}`,
    description: '',
    createdAt
});

describe('TodosService', () => {
    let dir: string;
    let file: string;

    const readStored = async (): Promise<ITodo[]> => JSON.parse(await readFile(file, 'utf8'));

    beforeEach(async () => {
        dir = await mkdtemp(path.join(tmpdir(), 'todos-service-'));
        file = path.join(dir, 'todos.json');
    });

    afterEach(async () => {
        await chmod(dir, 0o755).catch(() => {});
        await rm(dir, {recursive: true, force: true});
    });

    describe('initialization', () => {
        it('creates an empty storage file', async () => {
            new TodosService(file);
            assert.deepEqual(await readStored(), []);
        });

        it('creates missing parent directories', async () => {
            const nested = path.join(dir, 'a', 'b', 'todos.json');
            new TodosService(nested);
            assert.equal(await readFile(nested, 'utf8'), '[]');
        });

        it('keeps existing data', async () => {
            const existing = [storedTodo(1, '2026-01-01T00:00:00.000Z')];
            await writeFile(file, JSON.stringify(existing));
            new TodosService(file);
            assert.deepEqual(await readStored(), existing);
        });
    });

    describe('addTodo', () => {
        it('returns the created todo and persists it', async () => {
            const service = new TodosService(file);
            const todo = await service.addTodo(newTodo(1));

            assert.match(todo.id, /^[0-9a-f-]{36}$/);
            assert.equal(new Date(todo.createdAt).toISOString(), todo.createdAt);
            assert.deepEqual(await readStored(), [todo]);
        });

        it('does not keep extra fields from the input', async () => {
            const service = new TodosService(file);
            const input = {...newTodo(1), id: 'forged', createdAt: 'forged', isAdmin: true};
            const todo = await service.addTodo(input);

            assert.notEqual(todo.id, 'forged');
            assert.deepEqual(Object.keys((await readStored())[0]).sort(), ['createdAt', 'description', 'id', 'title']);
        });

        it('keeps every todo when called concurrently', async () => {
            const service = new TodosService(file);
            const added = await Promise.all(Array.from({length: 20}, (_, i) => service.addTodo(newTodo(i))));
            const stored = await readStored();

            assert.equal(stored.length, 20);
            assert.deepEqual(new Set(stored.map(todo => todo.id)), new Set(added.map(todo => todo.id)));
        });
    });

    describe('removeTodo', () => {
        it('removes only the matching todo', async () => {
            const service = new TodosService(file);
            const first = await service.addTodo(newTodo(1));
            const second = await service.addTodo(newTodo(2));

            await service.removeTodo(first.id);
            assert.deepEqual(await readStored(), [second]);
        });

        it('does not rewrite the file when the id is unknown', async () => {
            const original = JSON.stringify([storedTodo(1, '2026-01-01T00:00:00.000Z')]);
            await writeFile(file, original);
            const service = new TodosService(file);

            await service.removeTodo(crypto.randomUUID());
            assert.equal(await readFile(file, 'utf8'), original);
        });

        it('handles the same id removed twice concurrently', async () => {
            const service = new TodosService(file);
            const todo = await service.addTodo(newTodo(1));

            await Promise.all([service.removeTodo(todo.id), service.removeTodo(todo.id)]);
            assert.deepEqual(await readStored(), []);
        });

        it('keeps the right result when adds and removes interleave', async () => {
            const service = new TodosService(file);
            const initial = await Promise.all(Array.from({length: 10}, (_, i) => service.addTodo(newTodo(i))));

            await Promise.all([
                ...initial.slice(0, 5).map(todo => service.removeTodo(todo.id)),
                ...Array.from({length: 5}, (_, i) => service.addTodo(newTodo(100 + i)))
            ]);

            const stored = await readStored();
            assert.equal(stored.length, 10);
            assert.ok(initial.slice(0, 5).every(removed => !stored.some(todo => todo.id === removed.id)));
        });
    });

    describe('getTodos', () => {
        it('returns no todos and zero pages for empty storage', async () => {
            assert.deepEqual(await new TodosService(file).getTodos(1), {todos: [], totalPages: 0});
        });

        it('sorts newest first regardless of the order in the file', async () => {
            const old = storedTodo(1, '2026-01-01T00:00:00.000Z');
            const newest = storedTodo(2, '2026-03-01T00:00:00.000Z');
            const middle = storedTodo(3, '2026-02-01T00:00:00.000Z');
            await writeFile(file, JSON.stringify([old, newest, middle]));

            const {todos} = await new TodosService(file).getTodos(1);
            assert.deepEqual(todos, [newest, middle]);
        });

        it('paginates by two and counts pages', async () => {
            const stored = Array.from({length: 5}, (_, i) => storedTodo(i, `2026-01-0${i + 1}T00:00:00.000Z`));
            await writeFile(file, JSON.stringify(stored));
            const service = new TodosService(file);

            const page1 = await service.getTodos(1);
            const page3 = await service.getTodos(3);
            assert.equal(page1.totalPages, 3);
            assert.deepEqual(
                page1.todos.map(todo => todo.title),
                ['Stored 4', 'Stored 3']
            );
            assert.deepEqual(
                page3.todos.map(todo => todo.title),
                ['Stored 0']
            );
        });

        it('returns an empty page past the end', async () => {
            const service = new TodosService(file);
            await service.addTodo(newTodo(1));
            assert.deepEqual(await service.getTodos(5), {todos: [], totalPages: 1});
        });

        it('never sees a half-written file while writes are in progress', async () => {
            const service = new TodosService(file);
            const writes = Array.from({length: 30}, (_, i) => service.addTodo(newTodo(i)));
            const reads = Array.from({length: 30}, () => service.getTodos(1));

            const results = await Promise.allSettled([...writes, ...reads]);
            assert.deepEqual(
                results.filter(result => result.status === 'rejected'),
                []
            );
        });
    });

    describe('broken storage', () => {
        it('throws DataBrokenError with the SyntaxError as cause for invalid JSON and leaves the file as is', async t => {
            t.mock.method(console, 'error', () => {});
            await writeFile(file, '[{"id":');
            const service = new TodosService(file);

            const isBrokenJson = (error: DataBrokenError): boolean => {
                assert.ok(error instanceof DataBrokenError);
                assert.ok(error.cause instanceof SyntaxError);
                return true;
            };

            await assert.rejects(service.getTodos(1), isBrokenJson);
            await assert.rejects(service.addTodo(newTodo(1)), isBrokenJson);
            assert.equal(await readFile(file, 'utf8'), '[{"id":');
        });

        it('throws DataBrokenError when the root is not an array', async () => {
            for (const content of ['{}', 'null', '"todos"', '42', '', '   ']) {
                await writeFile(file, content);
                await assert.rejects(new TodosService(file).getTodos(1), DataBrokenError, content);
            }
        });

        it('throws DataBrokenError when one of the todos has a wrong shape', async () => {
            const valid = storedTodo(1, '2026-01-01T00:00:00.000Z');
            await writeFile(file, JSON.stringify([valid, {...valid, id: 'not-a-uuid'}]));
            await assert.rejects(new TodosService(file).getTodos(1), DataBrokenError);
        });

        it('keeps the mutation queue working after a failed mutation', async t => {
            t.mock.method(console, 'error', () => {});
            await writeFile(file, 'broken');
            const service = new TodosService(file);

            await assert.rejects(service.addTodo(newTodo(1)));
            await writeFile(file, '[]');
            await service.addTodo(newTodo(2));
            assert.equal((await readStored()).length, 1);
        });
    });

    describe('atomic writes', () => {
        it('leaves no temporary file after writes', async () => {
            const service = new TodosService(file);
            const todo = await service.addTodo(newTodo(1));
            await service.removeTodo(todo.id);
            assert.deepEqual(await readdir(dir), ['todos.json']);
        });

        it('replaces a stale temporary file left by a crash', async () => {
            await writeFile(`${file}.tmp`, 'garbage from a crashed write');
            const service = new TodosService(file);

            await service.addTodo(newTodo(1));
            assert.equal((await readStored()).length, 1);
            assert.deepEqual(await readdir(dir), ['todos.json']);
        });

        it(
            'throws FileOperationError with the cause and keeps the original file when writing fails',
            {skip: process.getuid?.() === 0 && 'root ignores directory permissions'},
            async t => {
                t.mock.method(console, 'error', () => {});
                const service = new TodosService(file);
                await chmod(dir, 0o555);

                await assert.rejects(service.addTodo(newTodo(1)), (error: FileOperationError) => {
                    assert.ok(error instanceof FileOperationError);
                    assert.equal((error.cause as NodeJS.ErrnoException).code, 'EACCES');
                    return true;
                });
                assert.deepEqual(await readStored(), []);
                assert.deepEqual(await readdir(dir), ['todos.json']);
            }
        );
    });
});
