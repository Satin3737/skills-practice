// basic closure
const sayMyName = () => {
    let name: string = 'Walter';

    return {
        regular: () => (name = 'Walter'),
        teacher: () => (name = 'Mr. White'),
        narco: () => (name = 'Heisenberg'),
        current: () => name
    };
};

const sayName = sayMyName();
console.log(sayName.teacher());
console.log(sayName.regular());
console.log(sayName.narco());
console.log(sayName.current());

// ------------------

// once() to run only one time
const once = (fn: (...args: unknown[]) => unknown) => {
    let called = false;
    let result: unknown;

    return (...args: unknown[]) => {
        if (!called) {
            called = true;
            result = fn(...args);
        }

        return result;
    };
};

const init = once(() => console.log('initialized!'));
init();
init();
init();

// ------------------

// memoize for caching results
const memoize = (fn: (...args: number[]) => number) => {
    const cache = new Map<string, number>();

    return (...args: number[]) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key)!;

        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

const expensiveAdd = memoize((a: number, b: number) => {
    console.log('computing...');
    return a + b;
});

console.log(expensiveAdd(1, 2));
console.log(expensiveAdd(1, 2));
