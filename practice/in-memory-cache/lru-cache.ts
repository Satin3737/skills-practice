import {LRUCache} from 'lru-cache';

const cache = new LRUCache<number, number>({
    max: 3,
    ttl: 1000 * 60,
    allowStale: false,
    updateAgeOnGet: true,
    onInsert: (value, key, reason) => {
        console.log(`Insert ${key} to cache with value ${JSON.stringify(value)} by ${reason}`);
    }
});

cache.set(1, 1);
cache.set(2, 2);
cache.set(3, 3);

console.log(cache.get(1));

cache.set(4, 4);

console.log(cache.get(2));

cache.clear();
