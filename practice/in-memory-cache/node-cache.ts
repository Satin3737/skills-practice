import NodeCache from 'node-cache';

const cache = new NodeCache({
    stdTTL: 0.1,
    checkperiod: 0.1,
    useClones: true,
    maxKeys: 10
});

cache.set(1, 1); // default ttl
cache.set(2, 2, 0.2); // custom ttl
cache.set(3, 3);
cache.set(4, 4);
cache.set(5, 5);

// cache state
console.log(cache.getStats(), 'cache stats');

console.log(cache.get<number>(1), 'get 1');

console.log(cache.mget([1, 2, 3, 4, 5]), 'get a few value');

cache.del(3);
cache.del([4, 5]);

console.log(cache.mget([1, 2, 3, 4, 5]), 'get after delete');

// reset ttl
cache.ttl(1); // to default
cache.ttl(2, 0.2); // to custom

// wait for expire
await new Promise(resolve => setTimeout(resolve, 1000));

console.log(cache.mget([1, 2, 3, 4, 5]), 'get after ttl expire');

cache.flushAll();

// events
cache.on('set', (key, value) => console.log(`set ${key} value: ${value}`));

cache.on('del', (key, value) => console.log(`del ${key} value: ${value}`));

cache.on('expired', (key, value) => console.log(`expired ${key} value: ${value}`));

cache.on('flush', () => console.log(`cache flush`));
