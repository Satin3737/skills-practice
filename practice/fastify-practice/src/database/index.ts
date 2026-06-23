import {PrismaPg} from '@prisma/adapter-pg';
import 'dotenv/config';
import {PrismaClient} from './prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Missing database credentials');

const adapter = new PrismaPg({connectionString});

export const Database = new PrismaClient({adapter});
