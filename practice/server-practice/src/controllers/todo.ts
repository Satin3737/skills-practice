import {flattenError} from 'zod';
import {TodosService} from '@/features/todos';
import {parseBody} from '@/helpers';
import type {IHandler} from '@/router';
import {deleteTodoSchema, newTodoSchema} from '@/schemas';
import {getHomePage, getNewTodoPage} from '@/templates';
import {MimeTypes} from '@/types';

class TodoController {
    private readonly todoService: TodosService = new TodosService();

    public homeTodoHandler: IHandler = async (_, res, {search}): Promise<void> => {
        const page = Math.max(1, Number(search.get('page')) || 1);
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
        const {success, data, error} = await newTodoSchema.safeParseAsync(body);

        if (!success) {
            const flatError = flattenError(error).fieldErrors;

            const parsedError = {
                title: flatError?.title?.[0] ?? '',
                description: flatError?.description?.[0] ?? ''
            };

            res.writeHead(422, {'Content-Type': MimeTypes.html}).end(getNewTodoPage(body, parsedError));
            return;
        }

        await this.todoService.addTodo(data);
        res.writeHead(302, {Location: '/'}).end();
    };

    public deleteTodoHandler: IHandler = async (_, res, {params}) => {
        const {success, data} = await deleteTodoSchema.safeParseAsync(params);
        success && (await this.todoService.removeTodo(data));
        res.writeHead(302, {Location: '/'}).end();
    };
}

export default TodoController;
