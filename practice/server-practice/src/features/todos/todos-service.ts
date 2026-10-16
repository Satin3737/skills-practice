import crypto from 'crypto';
import {existsSync, writeFileSync} from 'fs';
import {readFile, rename, unlink, writeFile} from 'fs/promises';
import path from 'path';
import {StorageDir} from '@/const';
import {DataBrokenError, FileOperationError} from '@/errors';
import {storedTodoValidator} from '@/schemas';
import type {INewTodo, ITodo} from './types';

class TodosService {
    private readonly pathToData: string = path.join(StorageDir, 'todos.json');
    private readonly pageSize: number = 2;
    private mutateQueue: Promise<unknown> = Promise.resolve();

    public constructor() {
        this.initialize();
    }

    public async getTodos(page: number): Promise<{todos: ITodo[]; totalPages: number}> {
        const allTodos = (await this.getAllTodos()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
        const totalPages = Math.ceil(allTodos.length / this.pageSize);
        const todos = allTodos.slice((page - 1) * this.pageSize, page * this.pageSize);
        return {todos, totalPages};
    }

    public async addTodo({title, description}: INewTodo): Promise<ITodo> {
        return this.addToQueue<ITodo>(async () => {
            const todos = await this.getAllTodos();
            const todo: ITodo = {id: crypto.randomUUID(), title, description, createdAt: new Date().toISOString()};
            todos.push(todo);
            await this.updateTodos(todos);
            return todo;
        });
    }

    public async removeTodo(id: ITodo['id']): Promise<void> {
        return this.addToQueue<void>(async () => {
            const todos = await this.getAllTodos();
            const filteredTodos = todos.filter(todo => todo.id !== id);
            if (filteredTodos.length === todos.length) return;
            await this.updateTodos(filteredTodos);
        });
    }

    private async getAllTodos(): Promise<ITodo[]> {
        const rawTodos = await readFile(this.pathToData, 'utf8');
        return this.parseRawTodos(rawTodos);
    }

    private async updateTodos(todos: ITodo[]): Promise<void> {
        const tempFilePath = `${this.pathToData}.tmp`;

        try {
            await writeFile(tempFilePath, JSON.stringify(todos, null, 4));
            await rename(tempFilePath, this.pathToData);
        } catch (cause) {
            await unlink(tempFilePath).catch(() => {});
            throw new FileOperationError(`Failed to update todos`, cause);
        }
    }

    private parseRawTodos(rawTodos: string): ITodo[] {
        const todos: unknown = JSON.parse(rawTodos);
        if (!Array.isArray(todos) || !todos.every(todo => this.checkTodoDataValid(todo))) {
            throw new DataBrokenError(`Data broken, check ${this.pathToData}`);
        }
        return todos;
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
        if (!existsSync(this.pathToData)) {
            writeFileSync(this.pathToData, JSON.stringify([]));
        }
    }
}

export default TodosService;
