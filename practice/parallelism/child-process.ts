import {exec, execFile, fork, spawn} from 'child_process';
import {fileURLToPath} from 'url';

// child_process: runs a SEPARATE OS process (own PID, own memory, own V8)
// use for: running external programs, or isolated node scripts
// 4 methods: spawn / exec / execFile / fork

// 1. spawn — streams stdout/stderr, does NOT buffer
// good for: long-running commands and large output
const ls = spawn('ls', ['-la']);

ls.stdout.on('data', data => {
    process.stdout.write(`[spawn] ${data}`);
});

ls.on('close', code => {
    console.log(`[spawn] exited with code ${code}\n`);
});

// 2. exec — runs command in a SHELL, buffers the whole output in memory
// good for: short commands; danger: shell injection + maxBuffer limit (~1MB)
exec('echo hello from shell', (err, stdout) => {
    if (err) return console.error(err);
    process.stdout.write(`[exec] ${stdout}`);
});

// 3. execFile — like exec but WITHOUT a shell
// faster + safer (no shell injection), args passed as array
execFile('node', ['--version'], (err, stdout) => {
    if (err) return console.error(err);
    process.stdout.write(`[execFile] node ${stdout}`);
});

// 4. fork — special case of spawn that launches a new NODE process
// auto-creates an IPC channel -> two-way messaging via send / 'message'
const childPath = fileURLToPath(new URL('./fork-child.ts', import.meta.url));
const child = fork(childPath);

child.on('message', msg => {
    console.log('[fork] got from child:', msg);
});

// data is serialized (structured clone) when crossing the process boundary
child.send({type: 'sum', numbers: [1, 2, 3, 4, 5]});
