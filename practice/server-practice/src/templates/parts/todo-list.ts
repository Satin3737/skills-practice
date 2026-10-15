import type {ITodo} from '@/features/todos';
import {escapeHtml} from '@/helpers';

const getTodoList = (todos: ITodo[]): string => {
    return todos
        .map(
            todo => `
                <li class="todo-item">
                    <div class="todo-column">
                        <h2 class="todo-title">
                            ${escapeHtml(todo.title)}
                        </h2>
                        <p class="todo-description">
                            ${escapeHtml(todo.description)}
                        </p>
                        <time datetime="${escapeHtml(todo.createdAt)}" class="todo-date">
                            ${new Date(todo.createdAt).toLocaleDateString()}
                        </time>
                    </div>
                    <form action="/todos/${escapeHtml(todo.id)}/delete" method="post" class="todo-done">
                        <button type="submit" class="button button-secondary">
                            Done
                        </button>
                    </form>
                </li>
            `
        )
        .join('');
};

export default getTodoList;
