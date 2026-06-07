const firstController = new AbortController();

// AbortSignal.any resolve with first signal in arr
const signal = AbortSignal.any([firstController.signal, AbortSignal.timeout(5000)]);

const res = await fetch('https://jsonplaceholder.typicode.com/todos/1', {signal});
res.ok && console.log(await res.json());
