import cluster from 'cluster';
import {createServer} from 'http';
import {cpus} from 'os';

// cluster: scale a server across CPU cores on ONE machine
// primary process forks N workers (via child_process.fork)
// all workers SHARE one listening socket -> incoming connections are spread across them
// linux default scheduling: round-robin (primary accepts, hands off to a worker)

const numWorkers = cpus().length;

if (cluster.isPrimary) {
    console.log(`[primary] pid ${process.pid}, forking ${numWorkers} workers`);

    // fork one worker per core
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    // workers DON'T share memory -> keep state in redis/db, not in-process
    // if a worker dies, respawn it (this is how zero-downtime restarts work)
    cluster.on('exit', worker => {
        console.log(`[primary] worker ${worker.process.pid} died, respawning`);
        cluster.fork();
    });
} else {
    // each worker runs its own server instance on the same port
    createServer((_req, res) => {
        res.end(`handled by worker pid ${process.pid}\n`);
    }).listen(3000);

    console.log(`[worker] pid ${process.pid} listening on :3000`);
}

// try it: curl http://localhost:3000 a few times -> different pids answer
