import {createReadStream, createWriteStream} from 'fs';
import path from 'path';
import {Transform} from 'stream';
import {pipeline} from 'stream/promises';
import {fileURLToPath} from 'url';
import {createGzip} from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const RootDir = path.dirname(__filename);
const inputFilePath = path.join(RootDir, 'input.txt');

console.log('readable');

const readable = createReadStream(inputFilePath, {highWaterMark: 64});

for await (const chunk of readable) {
    process.stdout.write(`[chunk ${chunk.length}b] `);
}

console.log('\ndone\n');

// --------------------------

console.log('writable');

const writable = createWriteStream(path.join(RootDir, 'output.txt'));

writable.write('first chunk\n');
writable.write('second chunk\n');
writable.write('third chunk\n');

await new Promise<void>(resolve => writable.end(resolve));
console.log('written to output.txt\n');

// --------------------------

console.log('transform');

const toUpperCase = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
        callback(null, chunk.toString().toUpperCase());
    }
});

await pipeline(createReadStream(inputFilePath), toUpperCase, createWriteStream(path.join(RootDir, 'output-upper.txt')));

console.log('written to output-upper.txt\n');

// --------------------------

console.log('backpressure');

const src = createReadStream(inputFilePath, {highWaterMark: 32});
const dst = createWriteStream(path.join(RootDir, 'output-backpressure.txt'));

let pauseCount = 0;

await new Promise<void>((resolve, reject) => {
    src.on('data', chunk => {
        const ok = dst.write(chunk);
        if (!ok) {
            pauseCount++;
            src.pause();
            dst.once('drain', () => src.resume());
        }
    });
    src.on('end', () => dst.end());
    dst.on('finish', resolve);
    src.on('error', reject);
    dst.on('error', reject);
});

console.log(`written to output-backpressure.txt (paused ${pauseCount} times)\n`);

// --------------------------

console.log('pipeline');

await pipeline(createReadStream(inputFilePath), createGzip(), createWriteStream(path.join(RootDir, 'output.txt.gz')));

console.log('written to output.txt.gz\n');
