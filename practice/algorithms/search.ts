// O(n)
const linearSearch = (target: number, arr: number[]): number | undefined => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return arr[i];
    }
};

console.log(linearSearch(5, [1, 2, 5, 6, 10]));
console.log(linearSearch(6, [10, 5, 6, 1]));

// ---

// O(log n) only for sorted arrays
const binarySearch = (target: number, arr: number[]): number | undefined => {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const curr = arr[mid];
        if (curr === target) return curr;
        curr < target ? (left = mid + 1) : (right = mid - 1);
    }
};

console.log(binarySearch(9, [1, 2, 3, 4, 5, 6, 7, 8, 9]));
console.log(binarySearch(2, [1, 2, 3, 4, 5, 6, 7, 8, 9]));
