import type {Token} from '@fastify/oauth2';
import {httpErrors} from '@fastify/sensible';
import type {IGoogleUserData, IOAuthLoginData} from '../types';
import BaseOAuthStrategy from './base';

class GoogleStrategy extends BaseOAuthStrategy {
    private readonly baseUrl: string = 'https://www.googleapis.com/oauth2/v3';

    public async authenticate({access_token, token_type}: Token): Promise<IOAuthLoginData> {
        const Authorization = `${token_type} ${access_token}`;

        const res = await fetch(`${this.baseUrl}/userinfo`, {headers: {Authorization}});
        if (!res.ok) throw httpErrors.unauthorized();

        const data = (await res.json()) as IGoogleUserData;
        if (!data) throw httpErrors.unauthorized();
        if (!data.email_verified) throw httpErrors.unauthorized('Email not verified');

        return {
            id: data.sub,
            email: data.email,
            name: data.name ?? data.email.split('@')[0]
        };
    }
}

export default GoogleStrategy;
