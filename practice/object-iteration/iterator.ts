const someRangeObj = {
    from: 1,
    to: 10
};

// iterate between from and to
const iterableSomeRangeObj = Object.assign(someRangeObj, {
    [Symbol.iterator]: function (this: typeof someRangeObj) {
        return {
            current: this.from,
            last: this.to,

            next() {
                return this.current <= this.last ? {done: false, value: this.current++} : {done: true};
            }
        };
    }
});

for (const num of iterableSomeRangeObj) {
    console.log(num);
}

// ------------------

const user = {
    id: 1,
    name: 'Colin',
    surname: 'Robinson',
    age: 116,
    isVamp: true
};

// iterate over all values
const iterableUser = Object.assign(user, {
    [Symbol.iterator]: function () {
        return {
            start: 0,
            last: Object.keys(this).length,
            userThis: this,

            next() {
                return this.start < this.last
                    ? {done: false, value: Object.values(this.userThis)[this.start++]}
                    : {done: true};
            }
        };
    }
});

for (const num of iterableUser) {
    console.log(num);
}
