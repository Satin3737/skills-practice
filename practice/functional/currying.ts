// basic currying — one argument at a time
const add = (a: number) => (b: number) => a + b;

const add5 = add(5); // partial application where b is still waiting
console.log(add5(3)); // 8
console.log(add5(10)); // 15

// reusable practical specialized functions
const multiply = (factor: number) => (value: number) => value * factor;

const double = multiply(2);
const triple = multiply(3);

console.log([1, 2, 3, 4].map(double)); // [2, 4, 6, 8]
console.log([1, 2, 3, 4].map(triple)); // [3, 6, 9, 12]

// generic curry() implementation
const curry = (originalFunc: CallableFunction) => {
    return function curried(...args: unknown[]) {
        if (args.length >= originalFunc.length) {
            return originalFunc(...args);
        }
        return (...more: unknown[]) => curried(...args, ...more);
    };
};

const sum = (a: number, b: number, c: number) => a + b + c;
const curriedSum = curry(sum);

console.log(curriedSum(1)(2)(3)); // 6 — one at a time
console.log(curriedSum(1, 2)(3)); // 6 — mixed
console.log(curriedSum(1)(2, 3)); // 6 — mixed
console.log(curriedSum(1, 2, 3)); // 6 — all at once

// names example
const getUserName = (name: string) => (surname: string) => (nickname: string) => `${name} ${surname} ${nickname}`;
const getWithNickname = getUserName('Bobby')('Brown');
console.log(getWithNickname('the Nickname'));

const curriedGetUserName = curry(getUserName);
console.log(curriedGetUserName('Tommy')('Tompson')('Gun'));
