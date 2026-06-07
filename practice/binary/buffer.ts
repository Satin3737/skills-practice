// Buffer - fixed-size chunk of raw binary memory.
// binary data - images, audio, network packets, crypto.

// create
const a = Buffer.from('hello', 'utf-8'); // from string
console.log(a);

const b = Buffer.from([0x48, 0x65, 0x6c]); // from byte array
console.log(b);

const c = Buffer.alloc(8); // 8 zero bytes
console.log(c);

const d = Buffer.allocUnsafe(8); // 8 uninitialized bytes, but may contain garbage
console.log(d);

// read
console.log(a.toString('utf-8'));
console.log(a.toString('hex'));
console.log(a.toString('base64'));
console.log(a[0]); // byte value
console.log(a.length); // bytes, not chars

// write
const slice = a.slice(0, 2);
slice[0] = 99; // will change original a buffer

// safe shallow copy
const copy = b.subarray(0, 2);
const safeCopy = Buffer.copyBytesFrom(b, 0, 2);
console.log(copy, 'copy');
console.log(safeCopy, 'safeCopy');

// concat
const result = Buffer.concat([a, b, c]);
console.log(result);
console.log(result.toString('utf8'));
