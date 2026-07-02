import {AccountProvider} from '@/database/prisma/enums';

export interface IOAuthStrategyParams {
    [AccountProvider.github]: {
        access_token: string;
        token_type: string;
    };
}

export interface IGithubUserData {
    id: number;
    login: string;
    name?: string;
    email?: string | null;
}

export interface IGithubUserEmailData {
    email: string;
    primary: boolean;
    verified: boolean;
}

export interface IOAuthLoginData {
    id: string | number;
    email: string;
    name: string;
}
