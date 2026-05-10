// macro
setTimeout(() => {
    console.log('timeout 1');
}, 0);

// stack
console.log('stack call 1');
console.log('stack call 2');

// micro
Promise.resolve().then(() => {
    console.log('promise 1');
});

// macro
setTimeout(() => {
    // micro created by macro
    Promise.resolve().then(() => {
        console.log('promise inside timeout');
    });
});

// macro
setTimeout(() => {
    console.log('timeout 2');
}, 0);

// micro
queueMicrotask(() => {
    console.log('queueMicrotask');
});

// micro
Promise.resolve().then(() => {
    console.log('promise 2');
});

// stack
console.log('stack call 3');

// browser event loop order:
// 1. all sync stack
// 2. all micro
// 3. one macro
// 4. all micro again (when macro create new micro)

// micro - Promise, queueMicrotask, MutationObserver
// macro - setTimeout, setInterval, setImmediate, io, events from UI listeners
