import http, {Server} from 'http';
import {AssetsDir, DocsDir, Port, RequestTimeout, ShutdownTimeout} from '@/const';
import {TodoController, createStaticHandler} from '@/controllers';
import {CustomError} from '@/errors';
import {Router} from '@/router';
import {getNotFoundPage, getServerErrorPage} from '@/templates';
import {type IMessage, type IMethods, type IStrictMessage, Methods, MimeTypes} from '@/types';

class AppServer {
    private readonly router: Router = new Router();
    private readonly server: Server = http.createServer();
    private readonly todoController: TodoController;

    public constructor(todoController: TodoController = new TodoController()) {
        this.todoController = todoController;
        this.registerRoutes();
        this.listenRequests();
    }

    public start(port: number = Port): Promise<number> {
        return new Promise((resolve, reject) => {
            this.server.once('error', reject);

            this.server.listen(port, () => {
                this.server.off('error', reject);
                const address = this.server.address();
                resolve(typeof address === 'object' && address ? address.port : port);
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close(error => (error ? reject(error) : resolve()));
        });
    }

    public listenShutdown(): void {
        process.once('SIGINT', signal => this.shutdownServer(signal));
        process.once('SIGTERM', signal => this.shutdownServer(signal));
    }

    private listenRequests(): void {
        this.server.requestTimeout = RequestTimeout;

        this.server.on('request', (req, res) => {
            const isValidMessage = this.checkUrlAndMethodIsValid(req, res);
            if (!isValidMessage) return;

            try {
                const matchedRoute = this.router.resolveRoute(req);

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
    }

    private handleServerError(res: IMessage['res'], error: unknown): void {
        const isCustomError = error instanceof CustomError;
        const status = isCustomError ? error.status : 500;
        const isClientError = status < 500;

        if (!isClientError) console.error('Error occurred:', error);

        if (res.headersSent) {
            if (!res.writableEnded) res.destroy();
            return;
        }

        const message = isClientError && isCustomError ? error.message : 'Internal Server Error';

        res.writeHead(status, {
            Connection: 'close',
            'Content-Type': MimeTypes.html
        }).end(getServerErrorPage(status, message), 'utf-8');
    }

    private checkUrlAndMethodIsValid(req: IMessage['req'], res: IMessage['res']): req is IStrictMessage['req'] {
        const isAllowed = !!req.url && !!req.method && this.isMethodAvailable(req.method);
        if (!isAllowed) res.writeHead(405).end('Method Not Allowed');
        return isAllowed;
    }

    private isMethodAvailable(method: string): method is IMethods {
        return Object.values<string>(Methods).includes(method);
    }

    private registerRoutes(): void {
        const {homeTodoHandler, newTodoHandler, addTodoHandler, deleteTodoHandler} = this.todoController;

        const routes = [
            {path: '/', method: Methods.get, handler: homeTodoHandler},
            {path: '/todos', method: Methods.get, handler: newTodoHandler},
            {path: '/todos', method: Methods.post, handler: addTodoHandler},
            {path: '/todos/:id/delete', method: Methods.post, handler: deleteTodoHandler},
            {path: '/assets/*', method: Methods.get, handler: createStaticHandler(AssetsDir)},
            {path: '/docs/*', method: Methods.get, handler: createStaticHandler(DocsDir)}
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
}

export default AppServer;
