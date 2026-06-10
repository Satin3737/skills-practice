import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppConfig} from '@/config/app.config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            extraProviders: [AppConfig],
            useFactory: (config: AppConfig) => ({
                ...config.dbCredentials,
                type: 'mysql',
                synchronize: true,
                autoLoadEntities: true
            }),
            inject: [AppConfig]
        })
    ]
})
export class DbModule {}
