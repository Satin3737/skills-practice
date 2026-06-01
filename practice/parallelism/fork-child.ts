// forked node process — separate memory, talks to parent only via IPC

interface SumTask {
    type: 'sum';
    numbers: number[];
}

process.on('message', (msg: SumTask) => {
    if (msg.type === 'sum') {
        const result = msg.numbers.reduce((acc, n) => acc + n, 0);

        // send result back to parent
        process.send?.({type: 'result', result});

        // nothing else to do -> exit so the process does not hang
        process.exit(0);
    }
});
