import {pbkdf2} from 'crypto';

// libuv for cross-platform io
// libuv - 4 thread
// 5 and 6 tests need almost x2 time

const startTime = Date.now();
const numberOfThreads = 4;
const tasksAboveThreadNumber = 2;

const testThreadFunc = (index: number): void => {
    pbkdf2('password', `salt: ${Math.random()}`, 1_000_000, 64, 'sha512', () => {
        console.log(`${index} end`, Date.now() - startTime);
    });
};

Array.from({length: numberOfThreads + tasksAboveThreadNumber})
    .map((_, i) => i + 1)
    .forEach(testThreadFunc);
