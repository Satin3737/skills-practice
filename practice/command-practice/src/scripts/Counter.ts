class Counter {
    private _count: number = 0;

    public get count(): number {
        return this._count;
    }

    public set count(value: number) {
        this._count = value;
    }

    public increment(): void {
        this._count++;
    }

    public decrement(): void {
        this._count--;
    }

    public reset(): void {
        this._count = 0;
    }
}

export default Counter;
