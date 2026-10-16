import {TodosService} from '@/features/todos';
import {parseBody} from '@/helpers';
import type {IHandler} from '@/router';
import {newTodoValidator, pageValidator, todoIdValidator} from '@/schemas';
import {getHomePage, getNewTodoPage} from '@/templates';
import {MimeTypes} from '@/types';

class TodoController {
    private readonly todoService: TodosService;

    public constructor(todoService: TodosService = new TodosService()) {
        this.todoService = todoService;
    }

    public homeTodoHandler: IHandler = async (_, res, {search}): Promise<void> => {
        const result = pageValidator.validate(Number(search.get('page')));
        const page = result.valid ? result.data : 1;

        const {todos, totalPages} = await this.todoService.getTodos(page);

        if (!!totalPages && page > totalPages) {
            res.writeHead(302, {Location: '/'}).end();
            return;
        }

        res.writeHead(200, {'Content-Type': MimeTypes.html}).end(getHomePage(todos, page, totalPages));
    };

    public newTodoHandler: IHandler = (_, res): void => {
        res.writeHead(200, {'Content-Type': MimeTypes.html}).end(getNewTodoPage());
    };

    public addTodoHandler: IHandler = async (req, res) => {
        const body = await parseBody(req);
        const result = newTodoValidator.validate(body);

        if (!result.valid) {
            const {innerErrors} = result;

            const parsedError = {
                title: innerErrors.title?.[0] ?? '',
                description: innerErrors.description?.[0] ?? ''
            };

            res.writeHead(422, {'Content-Type': MimeTypes.html}).end(getNewTodoPage(body, parsedError));
            return;
        }

        await this.todoService.addTodo(result.data);
        res.writeHead(302, {Location: '/'}).end();
    };

    public deleteTodoHandler: IHandler = async (_, res, {params}) => {
        const result = todoIdValidator.validate(params.id);
        result.valid && (await this.todoService.removeTodo(result.data));
        res.writeHead(302, {Location: '/'}).end();
    };
}

export default TodoController;
