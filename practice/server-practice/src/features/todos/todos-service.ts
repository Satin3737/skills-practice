import crypto from 'crypto';
import {createReadStream, createWriteStream, existsSync, mkdirSync, writeFileSync} from 'fs';
import {rename, unlink} from 'fs/promises';
import path from 'path';
import {createInterface} from 'readline/promises';
import {pipeline} from 'stream/promises';
import {StorageDir} from '@/const';
import {DataBrokenError, FileOperationError} from '@/errors';
import {storedTodoValidator} from '@/schemas';
import type {INewTodo, ITodo, ITodoTransform} from './types';

class TodosService {
    private readonly pathToData: string;
    private readonly pageSize: number = 2;
    private mutateQueue: Promise<unknown> = Promise.resolve();

    public constructor(pathToData: string = path.join(StorageDir, 'todos.jsonl')) {
        this.pathToData = pathToData;
        this.initialize();
    }

    public async getTodos(page: number): Promise<{todos: ITodo[]; totalPages: number}> {
        const limit = page * this.pageSize;
        const newestTodos: ITodo[] = [];
        let total: number = 0;

        for await (const todo of this.readTodos()) {
            total++;
            const position = this.getTodoPosition(newestTodos, todo);
            if (position >= limit) continue;
            newestTodos.splice(position, 0, todo);
            if (newestTodos.length > limit) newestTodos.pop();
        }

        const todos = newestTodos.slice((page - 1) * this.pageSize);
        return {todos, totalPages: Math.ceil(total / this.pageSize)};
    }

    public async addTodo({title, description}: INewTodo): Promise<ITodo> {
        return this.addToQueue<ITodo>(async () => {
            const todo: ITodo = {id: crypto.randomUUID(), title, description, createdAt: new Date().toISOString()};

            await this.rewriteTodos(async function* (todos: AsyncIterable<ITodo>) {
                yield* todos;
                yield todo;
            });

            return todo;
        });
    }

    public async removeTodo(id: ITodo['id']): Promise<void> {
        return this.addToQueue<void>(async () => {
            if (!(await this.todoExists(id))) return;

            await this.rewriteTodos(async function* (todos: AsyncIterable<ITodo>) {
                for await (const todo of todos) {
                    if (todo.id !== id) yield todo;
                }
            });
        });
    }

    private async todoExists(id: ITodo['id']): Promise<boolean> {
        for await (const todo of this.readTodos()) if (todo.id === id) return true;
        return false;
    }

    private async rewriteTodos(transform: ITodoTransform): Promise<void> {
        const tempFilePath = `${this.pathToData}.tmp`;

        try {
            await pipeline(
                transform(this.readTodos()),
                async function* (todos: AsyncIterable<ITodo>) {
                    for await (const todo of todos) yield `${JSON.stringify(todo)}\n`;
                },
                createWriteStream(tempFilePath)
            );
            await rename(tempFilePath, this.pathToData);
        } catch (cause) {
            await unlink(tempFilePath).catch(() => {});
            if (cause instanceof DataBrokenError) throw cause;
            throw new FileOperationError(`Failed to update todos`, cause);
        }
    }

    private async *readTodos(): AsyncGenerator<ITodo> {
        const lines = createInterface({input: createReadStream(this.pathToData, {encoding: 'utf8'})});
        for await (const line of lines) if (line.trim()) yield this.parseTodo(line);
    }

    private getTodoPosition(todos: ITodo[], todoForCheck: ITodo): number {
        const createdAt = Date.parse(todoForCheck.createdAt);
        const index = todos.findIndex(todo => Date.parse(todo.createdAt) < createdAt);
        return index === -1 ? todos.length : index;
    }

    private parseTodo(todoLine: string): ITodo {
        let todo: unknown;

        try {
            todo = JSON.parse(todoLine);
        } catch (cause) {
            throw new DataBrokenError(`Data broken, check ${this.pathToData}`, cause);
        }

        if (!this.checkTodoDataValid(todo)) throw new DataBrokenError(`Data broken, check ${this.pathToData}`);

        return todo;
    }

    private checkTodoDataValid(todo: unknown): todo is ITodo {
        return storedTodoValidator.validate(todo).valid;
    }

    private addToQueue<T>(cb: () => Promise<T>): Promise<T> {
        const nextMutation = this.mutateQueue.then(cb, cb);
        this.mutateQueue = nextMutation.catch(error => console.error('Error occurred in mutate queue', error));
        return nextMutation;
    }

    private initialize(): void {
        mkdirSync(path.dirname(this.pathToData), {recursive: true});
        if (!existsSync(this.pathToData)) writeFileSync(this.pathToData, '');
    }
}

export default TodosService;
