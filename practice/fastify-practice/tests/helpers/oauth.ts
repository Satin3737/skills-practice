import type {OAuth2Namespace, OAuth2Token} from '@fastify/oauth2';
import type {FastifyRequest} from 'fastify';
import {vi} from 'vitest';
import {buildToken} from './jwt';

interface ISingleArgOAuth2 {
    getAccessTokenFromAuthorizationCodeFlow(request: FastifyRequest): Promise<OAuth2Token>;
}

const buildOAuth2Token = (accessToken: string): OAuth2Token => {
    return {token: buildToken(accessToken)} as unknown as OAuth2Token;
};

export const mockOAuthToken = (namespace: OAuth2Namespace, accessToken: string): void => {
    const target = namespace as unknown as ISingleArgOAuth2;
    vi.spyOn(target, 'getAccessTokenFromAuthorizationCodeFlow').mockResolvedValue(buildOAuth2Token(accessToken));
};

export const mockFetchResponses = (responses: Record<string, unknown>): void => {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (input: string | URL) => {
            const url = input.toString();
            const match = Object.entries(responses).find(([path]) => url.endsWith(path));
            if (!match) throw new Error(`Unexpected fetch to ${url}`);
            return new Response(JSON.stringify(match[1]), {status: 200});
        })
    );
};
