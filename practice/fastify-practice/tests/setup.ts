import path from 'path';

const rootDir = path.dirname(import.meta.dirname);

process.loadEnvFile(path.join(rootDir, '.env.test'));
