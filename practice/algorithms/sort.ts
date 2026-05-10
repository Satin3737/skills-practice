// O(n2)
const selectionSort = (arr: number[]): number[] => {
    const len = arr.length;

    for (let i = 0; i < len - 1; i++) {
        let minIndex = i;

        for (let g = i + 1; g < len; g++) {
            if (arr[g] < arr[minIndex]) {
                minIndex = g;
            }

            if (minIndex !== i) {
                const temp = arr[i];
                arr[i] = arr[minIndex];
                arr[minIndex] = temp;
            }
        }
    }

    return arr;
};

console.log(selectionSort([9, 1, 7, 6, 3, 2, 1]));

// ---

// O(n2)
const bubbleSort = (arr: number[]): number[] => {
    const len = arr.length;

    for (let i = 0; i < len - 1; i++) {
        for (let g = 0; g < len - 1 - i; g++) {
            if (arr[g] > arr[g + 1]) {
                const temp = arr[g];
                arr[g] = arr[g + 1];
                arr[g + 1] = temp;
            }
        }
    }

    return arr;
};

console.log(bubbleSort([9, 1, 7, 6, 3, 2, 1]));

// ---

// O(n log n)
// with divide into 2 arrays
const quickSortByDivide = (arr: number[]): number[] => {
    if (arr.length <= 1) return arr;

    const left = [];
    const right = [];

    const pivotIndex = Math.floor(arr.length * 0.5);
    const pivot = arr[pivotIndex];

    for (let i = 0; i < arr.length; i++) {
        if (i === pivotIndex) {
            continue;
        }

        arr[i] < pivot ? left.push(arr[i]) : right.push(arr[i]);
    }

    return quickSortByDivide(left).concat(pivot, quickSortByDivide(right));
};

console.log(quickSortByDivide([9, 1, 7, 6, 3, 2, 1]));

// ---

// O(n log n)
// with two cursors
const partition = (arr: number[], left: number, right: number): number => {
    const pivot = arr[Math.floor((left + right) / 2)];

    let leftI = left - 1;
    let rightI = right + 1;

    while (true) {
        do {
            leftI++;
        } while (arr[leftI] < pivot);

        do {
            rightI--;
        } while (arr[rightI] > pivot);

        if (leftI >= rightI) return rightI;

        [arr[leftI], arr[rightI]] = [arr[rightI], arr[leftI]];
    }
};

const quickSort = (arr: number[], left: number = 0, right: number = arr.length - 1): number[] => {
    if (left >= right) return arr;

    const pivotIndex = partition(arr, left, right);
    quickSort(arr, left, pivotIndex);
    quickSort(arr, pivotIndex + 1, right);

    return arr;
};

console.log(quickSort([9, 1, 7, 6, 3, 2, 1]));
