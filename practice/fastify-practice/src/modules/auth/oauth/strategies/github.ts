import type {Token} from '@fastify/oauth2';
import {httpErrors} from '@fastify/sensible';
import type {IGithubUserData, IGithubUserEmailData, IOAuthLoginData} from '../types';
import BaseOAuthStrategy from './base';

class GithubStrategy extends BaseOAuthStrategy {
    private readonly baseUrl: string = 'https://api.github.com';

    public async authenticate({access_token, token_type}: Token): Promise<IOAuthLoginData> {
        const authHeader = `${token_type} ${access_token}`;
        const res = await this.fetchGhUserData<IGithubUserData>('/user', authHeader);

        let email = res?.email;

        if (!email) {
            const userEmails = await this.fetchGhUserData<IGithubUserEmailData[]>('/user/emails', authHeader);
            const validEmail = userEmails?.find(e => e.primary && e.verified)?.email;
            if (validEmail) {
                email = validEmail;
            } else {
                throw httpErrors.unauthorized('Email not found in GitHub account');
            }
        }

        return {
            id: res.id,
            email,
            name: res.name ?? res.login
        };
    }

    private async fetchGhUserData<TData>(url: string, authHeader: string): Promise<TData> {
        const res = await fetch(`${this.baseUrl}${url}`, {headers: {Authorization: authHeader}});
        if (!res.ok) throw httpErrors.unauthorized();
        return (await res.json()) as TData;
    }
}

export default GithubStrategy;
