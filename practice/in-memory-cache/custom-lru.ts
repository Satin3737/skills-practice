class LRUCache<Key, Value> {
    private readonly maxSize: number;
    private cache: Map<Key, Value>;

    public constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.cache = new Map<Key, Value>();
    }

    public get size(): number {
        return this.cache.size;
    }

    public get(key: Key): Value | null {
        if (!this.cache.has(key)) return null;

        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);

        return value;
    }

    public set(key: Key, value: Value): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const lruKey = this.cache.keys().next().value;
            !!lruKey && this.cache.delete(lruKey);
        }

        this.cache.set(key, value);
    }

    public has(key: Key): boolean {
        return this.cache.has(key);
    }

    public remove(key: Key): void {
        if (this.cache.has(key)) this.cache.delete(key);
    }
}

const cache = new LRUCache(3);

console.log(cache, 'initial cache');

cache.set(1, 1);
cache.set(2, 2);
cache.set(3, 3);

console.log(cache, 'with first 3 items');

cache.get(1);

console.log(cache, 'after requesting first item');

cache.set(4, 4);

console.log(cache, 'after setting new item');

console.log(cache.has(2), 'check state item');

cache.remove(1);

console.log(cache, 'after delete item');
