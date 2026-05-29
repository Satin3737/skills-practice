interface ITodo {
    id: number;
    userId: number;
    title: string;
    completed: boolean;
}

abstract class TodosService {
    public abstract fetchTodo(id: number): Promise<ITodo | null>;
}

class RealTodosService extends TodosService {
    private readonly apiBaseUrl: string = 'https://jsonplaceholder.typicode.com';

    public async fetchTodo(id: number): Promise<ITodo | null> {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const res = await fetch(`${this.apiBaseUrl}/todos/${id}`);
            return res.ok ? await res.json() : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}

class ProxyTodosService extends TodosService {
    private readonly realService: RealTodosService;
    private readonly todosCache: Map<number, ITodo> = new Map<number, ITodo>();
    private readonly cacheTimeMs: number = 10000;

    public constructor(realService: RealTodosService) {
        super();
        this.realService = realService;
        this.startRevalidateCacheTimer();
    }

    public async fetchTodo(id: number): Promise<ITodo | null> {
        if (this.todosCache.has(id)) return this.todosCache.get(id) ?? null;
        const todos = await this.realService.fetchTodo(id);
        if (todos) this.todosCache.set(id, todos);
        return todos;
    }

    private startRevalidateCacheTimer(): void {
        setInterval(() => {
            this.todosCache.clear();
            console.log('revalidation');
        }, this.cacheTimeMs);
    }
}

class App {
    private readonly service: TodosService;

    public constructor() {
        this.service = new ProxyTodosService(new RealTodosService());
    }

    public async getTodo(id: number): Promise<ITodo | null> {
        return await this.service.fetchTodo(id);
    }
}

const app = new App();

const todo1 = await app.getTodo(1);
console.log(todo1, 'todo1');

const todo1Cached = await app.getTodo(1);
console.log(todo1Cached, 'todo1Cached');

const todo2 = await app.getTodo(2);
console.log(todo2, 'todo2');

const todo2Cached = await app.getTodo(2);
console.log(todo2Cached, 'todo2Cached');

// wait for revalidation timer
await new Promise(resolve => setTimeout(resolve, 10000));

const todo1Next = await app.getTodo(1);
console.log(todo1Next, 'todo1Next');
