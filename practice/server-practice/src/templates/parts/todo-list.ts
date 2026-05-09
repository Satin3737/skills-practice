import type {ITodo} from '@/features/todos';

const getTodoList = (todos: ITodo[]): string => {
    return todos
        .map(
            todo => `
                <li class="todo-item">
                    <div class="todo-column">
                        <h2 class="todo-title">
                            ${todo.title}
                        </h2>
                        <p class="todo-description">
                            ${todo.description}
                        </p>
                        <time datetime="${todo.createdAt}" class="todo-date">
                            ${new Date(todo.createdAt).toLocaleDateString()}
                        </time>
                    </div>
                    <form action="/todos/${todo.id}/delete" method="post" class="todo-done">
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
