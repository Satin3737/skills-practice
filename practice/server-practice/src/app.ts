import {existsSync, mkdirSync} from 'fs';
import http, {Server} from 'http';
import {BaseUrl, Port, StorageDir} from '@/const';
import {TodoController, staticHandler} from '@/controllers';
import {Router} from '@/router';
import {getNotFoundPage} from '@/templates';
import {type IMessage, type IStrictMessage, Methods, MimeTypes} from '@/types';

class App {
    private readonly router: Router;
    private readonly server: Server;

    public constructor() {
        this.router = new Router();
        this.server = http.createServer();
        this.initialize();
    }

    private startServer(): void {
        this.server.on('request', (req, res) => {
            const isValidMessage = this.checkUrlAndMethodIsValid(req, res);
            if (!isValidMessage) return;

            const matchedRoute = this.router.resolveRoute(req);

            try {
                if (matchedRoute) {
                    const {handler, params, search} = matchedRoute;

                    Promise.resolve(handler(req, res, {params, search})).catch(err => {
                        this.handleServerError(res, err);
                    });
                } else {
                    res.writeHead(404, {'Content-Type': MimeTypes.html}).end(getNotFoundPage(), 'utf-8');
                }
            } catch (err) {
                this.handleServerError(res, err);
            }
        });

        this.server.listen(Port);
        console.log('Server started:', BaseUrl);
    }

    private handleServerError(res: IMessage['res'], err: unknown): void {
        console.error('Unhandled error in handler:', err);
        if (!res.headersSent) res.writeHead(500).end('Internal server error');
    }

    private checkUrlAndMethodIsValid(req: IMessage['req'], res: IMessage['res']): req is IStrictMessage['req'] {
        const isValid = !!req.url && !!req.method && this.router.isMethodAvailable(req.method);
        if (!isValid) res.writeHead(400).end('Bad request');
        return isValid;
    }

    private registerRoutes(): void {
        const todoController = new TodoController();

        const routes = [
            {path: '/', method: Methods.get, handler: todoController.homeTodoHandler},
            {path: '/todos', method: Methods.get, handler: todoController.newTodoHandler},
            {path: '/todos', method: Methods.post, handler: todoController.addTodoHandler},
            {path: '/todos/:id/delete', method: Methods.post, handler: todoController.deleteTodoHandler},
            {path: '/assets/*', method: Methods.get, handler: staticHandler}
        ];

        routes.forEach(route => this.router.registerRoute(route));
    }

    private initialize(): void {
        if (!existsSync(StorageDir)) mkdirSync(StorageDir, {recursive: true});
        this.registerRoutes();
        this.startServer();
    }
}

new App();
