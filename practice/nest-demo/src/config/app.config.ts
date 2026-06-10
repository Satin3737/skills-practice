import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {IDatabaseCredentials} from './types';

@Injectable()
export class AppConfig {
    constructor(private readonly configService: ConfigService) {}

    public get port(): number {
        return this.configService.get<number>('PORT') || 3000;
    }

    public get dbCredentials(): IDatabaseCredentials {
        const dbCredentials = {
            host: this.configService.get<string>('MYSQL_HOST'),
            port: this.configService.get<number>('MYSQL_PORT'),
            username: this.configService.get<string>('MYSQL_USER'),
            database: this.configService.get<string>('MYSQL_DATABASE'),
            password: this.configService.get<string>('MYSQL_PASSWORD'),
            rootPassword: this.configService.get<string>('MYSQL_ROOT_PASSWORD')
        } satisfies Partial<IDatabaseCredentials>;

        if (!this.isValidCredentials(dbCredentials)) throw new Error('Invalid database credentials');

        return dbCredentials;
    }

    private isValidCredentials(credentials: Partial<IDatabaseCredentials>): credentials is IDatabaseCredentials {
        return Object.values(credentials).every(Boolean);
    }
}
