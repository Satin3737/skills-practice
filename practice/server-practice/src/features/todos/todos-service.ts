import crypto from 'crypto';
import {existsSync, writeFileSync} from 'fs';
import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {StorageDir} from '@/const';
import type {INewTodo, ITodo} from './types';

class TodosService {
    private readonly pathToData: string = path.join(StorageDir, 'todos.json');
    private readonly pageSize: number = 2;

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
        const todos = await this.getAllTodos();
        const todo: ITodo = {id: crypto.randomUUID(), title, description, createdAt: new Date().toISOString()};
        todos.push(todo);
        await this.updateTodos(todos);
        return todo;
    }

    public async removeTodo(id: ITodo['id']): Promise<void> {
        const todos = await this.getAllTodos();
        const filteredTodos = todos.filter(todo => todo.id !== id);
        if (filteredTodos.length === todos.length) return;
        await this.updateTodos(filteredTodos);
    }

    private async getAllTodos(): Promise<ITodo[]> {
        const rawTodos = await readFile(this.pathToData, 'utf8');
        return this.parseRawTodos(rawTodos);
    }

    private async updateTodos(todos: ITodo[]): Promise<void> {
        await writeFile(this.pathToData, JSON.stringify(todos, null, 4));
    }

    private parseRawTodos(rawTodos: string): ITodo[] {
        try {
            return JSON.parse(rawTodos) ?? [];
        } catch (e) {
            console.error('Failed to parse raw todos', e);
            return [];
        }
    }

    private initialize(): void {
        if (!existsSync(this.pathToData)) {
            writeFileSync(this.pathToData, JSON.stringify([]));
        }
    }
}

export default TodosService;
