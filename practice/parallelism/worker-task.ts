import {parentPort, workerData} from 'worker_threads';

function fib(n: number): number {
    return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

const result = fib(workerData as number);

// send the result back to the thread that spawned us
parentPort?.postMessage(result);
