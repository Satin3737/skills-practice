import {execSync} from 'child_process';
import path from 'path';
import {Client} from 'pg';

const rootDir = path.dirname(import.meta.dirname);

process.loadEnvFile(path.join(rootDir, '.env.test'));

const testDbUrl = new URL(process.env.DATABASE_URL!);
const targetDb = testDbUrl.pathname.slice(1);

const maintenanceUrl = new URL(testDbUrl);
maintenanceUrl.pathname = '/postgres';

const client = new Client({connectionString: maintenanceUrl.toString()});
await client.connect();

const {rowCount} = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
if (rowCount === 0) await client.query(`CREATE DATABASE "${targetDb}"`);
await client.end();

execSync('npx prisma migrate deploy', {cwd: rootDir, stdio: 'inherit', env: process.env});
