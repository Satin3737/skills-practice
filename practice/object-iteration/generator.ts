// infinite generator create value on demand
function* randomNumbers(min: number, max: number) {
    while (true) {
        yield Math.random() * (max - min) + min;
    }
}

for (const value of randomNumbers(10, 100)) {
    console.log(value);
    if (value < 20) break;
}

// --------------------------

// generator as Symbol.iterator for object
const rangeObj = {
    from: 1,
    to: 10,
    *[Symbol.iterator]() {
        for (let i = this.from; i <= this.to; i++) {
            yield i;
        }
    }
};

for (const num of rangeObj) {
    console.log(num);
}

// --------------------------

// generator use cases
function* someRange(from: number, to: number) {
    for (let i = from; i <= to; i++) {
        yield i;
    }
}

//for...of
for (const num of someRange(1, 10)) {
    console.log(num);
}

// spread collects array
console.log([...someRange(1, 10)]);

// destructuring
const [first, second] = someRange(1, 2);
console.log(first, second);

// .next() manual call
const generator = someRange(1, 10);
console.log(generator.next().value); // { value: 1, done: false }
console.log(generator.next().value); // { value: 2, done: false }

// Array.from();
console.log(Array.from(someRange(1, 5)));
