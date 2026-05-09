import type {ITodo} from '@/features/todos';
import {getLayout} from './base';
import {getEmptyTodos, getPagination, getTodoList} from './parts';

const getHomePage = (todos: ITodo[], page: number, totalPages: number): string => {
    const todoList = getTodoList(todos);

    const content = `
        <h1 class="title">
            Fancy todo list, bro
        </h1>
        <ul class="todo-list">
            ${todoList.length ? todoList : getEmptyTodos()}
        </ul>
        ${getPagination('/', page, totalPages)}
        <a href="/todos" class="button button-primary">
            Add new one
        </a>
    `;

    return getLayout(content);
};

export default getHomePage;
