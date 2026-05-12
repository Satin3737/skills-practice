import '@/styles/index.css';

class WorkerDemo {
    private readonly N = 42;

    private count = 0;
    private resultEl = document.querySelector('[data-result]')!;
    private counterEl = document.querySelector('[data-counter]')!;

    public constructor() {
        this.startCounter();
        this.initListeners();
    }

    private startCounter(): void {
        setInterval(() => {
            this.count++;
            this.counterEl.textContent = this.count.toString();
        }, 100);
    }

    private runInWorker(): void {
        this.resultEl.textContent = 'Computing in worker...';

        const worker = new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'});

        worker.postMessage(this.N);

        worker.onmessage = (e: MessageEvent<number>) => {
            this.resultEl.textContent = `Worker result: fibonacci(${this.N}) = ${e.data}`;
            worker.terminate();
        };
    }

    private runOnMainThread(): void {
        this.resultEl.textContent = 'Computing on main thread...';

        setTimeout(() => {
            const start = performance.now();
            const result = this.fibonacci(this.N);
            const duration = (performance.now() - start).toFixed(0);
            this.resultEl.textContent = `Main thread result: fibonacci(${this.N}) = ${result} (UI freeze for ${duration}ms)`;
        }, 50);
    }

    private fibonacci(n: number): number {
        if (n <= 1) return n;
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }

    private initListeners(): void {
        document.querySelector('[data-action="worker"]')?.addEventListener('click', () => this.runInWorker());
        document.querySelector('[data-action="main"]')?.addEventListener('click', () => this.runOnMainThread());
    }
}

new WorkerDemo();
