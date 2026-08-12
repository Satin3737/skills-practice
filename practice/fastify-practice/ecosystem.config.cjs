module.exports = {
    apps: [
        {
            name: 'api',
            script: './dist/app.js',
            instances: 4,
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            max_memory_restart: '1G',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            kill_timeout: 5000,
            cwd: __dirname
        },
        {
            name: 'email-worker',
            script: './dist/workers/processes/email.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production'
            },
            max_memory_restart: '256M',
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            kill_timeout: 5000,
            cwd: __dirname
        }
    ]
};
