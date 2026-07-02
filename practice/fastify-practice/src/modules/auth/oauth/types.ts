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

export interface IGoogleUserData {
    sub: string;
    name?: string;
    email: string;
    email_verified: boolean;
}

export interface IOAuthLoginData {
    id: string | number;
    email: string;
    name: string;
}
