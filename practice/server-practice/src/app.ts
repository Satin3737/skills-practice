import {existsSync, mkdirSync} from 'fs';
import http, {Server} from 'http';
import {BaseUrl, Port, RequestTimeout, ShutdownTimeout, StorageDir} from '@/const';
import {TodoController, staticHandler} from '@/controllers';
import {CustomError} from '@/errors';
import {Router} from '@/router';
import {getNotFoundPage, getServerErrorPage} from '@/templates';
import {type IMessage, type IMethods, type IStrictMessage, Methods, MimeTypes} from '@/types';

class App {
    private readonly router: Router;
    private readonly server: Server;

    public constructor() {
        this.router = new Router();
        this.server = http.createServer();
        this.initialize();
    }

    private startServer(): void {
        this.server.requestTimeout = RequestTimeout;

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

    private handleServerError(res: IMessage['res'], error: unknown): void {
        const isCustomError = error instanceof CustomError;
        const status = isCustomError ? error.status : 500;
        const isClientError = status < 500;

        if (!isClientError) console.error('Error occurred:', error);
        if (res.headersSent) return;

        const message = isClientError && isCustomError ? error.message : 'Internal Server Error';

        res.writeHead(status, {
            Connection: 'close',
            'Content-Type': MimeTypes.html
        }).end(getServerErrorPage(status, message), 'utf-8');
    }

    private checkUrlAndMethodIsValid(req: IMessage['req'], res: IMessage['res']): req is IStrictMessage['req'] {
        const isValid = !!req.url && !!req.method && this.isMethodAvailable(req.method);
        if (!isValid) res.writeHead(400).end('Bad request');
        return isValid;
    }

    private isMethodAvailable(method: string): method is IMethods {
        return method.toLowerCase() in Methods;
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

    private shutdownServer(signal: string): void {
        console.log(`Shutting down server due to ${signal}`);

        this.server.close(error => {
            if (error) console.error('Error occurred while shutting down server:', error);
            console.log(`Server stopped due to ${signal}`);
        });

        setTimeout(() => {
            console.log(`Forcefully exiting due to ${signal}, time elapsed: ${ShutdownTimeout / 1000} seconds`);
            this.server.closeAllConnections();
            process.exit(1);
        }, ShutdownTimeout).unref();
    }

    private listenShutdown(): void {
        process.once('SIGINT', signal => this.shutdownServer(signal));
        process.once('SIGTERM', signal => this.shutdownServer(signal));
    }

    private initialize(): void {
        if (!existsSync(StorageDir)) mkdirSync(StorageDir, {recursive: true});
        this.registerRoutes();
        this.startServer();
        this.listenShutdown();
    }
}

new App();
