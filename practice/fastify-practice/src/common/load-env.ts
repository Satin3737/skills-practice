try {
    process.loadEnvFile();
} catch (err) {
    if (!(err instanceof Error) || !('code' in err) || err.code !== 'ENOENT') throw err;
}
