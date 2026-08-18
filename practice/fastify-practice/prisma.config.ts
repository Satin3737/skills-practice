import {defineConfig, env} from 'prisma/config';
import './src/common/load-env';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations'
    },
    datasource: {
        url: env('DATABASE_URL')
    }
});
