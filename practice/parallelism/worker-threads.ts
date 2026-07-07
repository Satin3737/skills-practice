import {fileURLToPath} from 'url';
import {Worker} from 'worker_threads';

// worker_threads: real threads INSIDE one process
// each worker has its own event loop + V8 isolate, but they share the process
// lighter than child_process: faster start, less memory, can share memory
// use for: CPU-bound work (heavy calc, parsing, hashing) without blocking main thread

const workerPath = fileURLToPath(new URL('./worker-task.ts', import.meta.url));

// run one heavy task in a worker so the main event loop stays free
function runTask(n: number): Promise<number> {
    return new Promise((resolve, reject) => {
        // workerData is cloned and passed into the worker at creation
        const worker = new Worker(workerPath, {workerData: n});

        // messages cross the boundary via structured clone (ArrayBuffer can be transferred)
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0) reject(new Error(`worker stopped with code ${code}`));
        });
    });
}

// main thread is NOT blocked: this log prints before the heavy work finishes
console.log('[main] dispatching CPU work to workers...');

// note: don't create a worker per task in real code -> use a pool (e.g. piscina)
// here we just fan out a few tasks in parallel to show it works
const results = await Promise.all([runTask(40), runTask(41), runTask(42)]);

console.log('[main] results:', results);
