import {readFile} from 'fs';
import {fileURLToPath} from 'url';

// event loop
// https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick

// order
// process.nextTick > Promise.then > phases

// event loop phases
// timers callbacks (setTimeout, setInterval)
// pending io callbacks (from prev tick)
// idle, prepare (node behind the scenes staff)
// poll (new io events, run io callbacks)
// check (setImmediate)
// close callbacks (cleanup)

// inside io cb setImmediate before timers

// example

// timers phase
setTimeout(() => {
    console.log('setTimeout');
}, 0);

// check phase
setImmediate(() => {
    console.log('setImmediate');
});

// stack
console.log('stack call 1');

// microtask - runs after nextTick, before phases
Promise.resolve().then(() => {
    console.log('promise');
});

// special queue - runs before any phase, before promises
process.nextTick(() => {
    console.log('nextTick');
});

// stack
console.log('stack call 2');

readFile(fileURLToPath(import.meta.url), () => {
    // already past timers phase, so check phase (setImmediate) comes first
    setTimeout(() => console.log('io: setTimeout'), 0);
    setImmediate(() => console.log('io: setImmediate'));
});
