import {randomBytes} from 'crypto';
import type {FastifyInstance, LightMyRequestResponse} from 'fastify';
import type {IRegisterUserData} from '@/modules/auth/types';

type IRegisteredUser = Required<Pick<IRegisterUserData, 'email' | 'password' | 'callSign'>> & {
    res: LightMyRequestResponse;
};

export const registerUser = async (
    app: FastifyInstance,
    opts: Partial<IRegisterUserData> = {}
): Promise<IRegisteredUser> => {
    const id = randomBytes(4).toString('hex');
    const email = opts.email ?? `user-${id}@example.com`;
    const password = opts.password ?? 'password123';
    const callSign = opts.callSign ?? `TK-${id}`;

    const res = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {email, password, callSign, ...(opts.rank && {rank: opts.rank})}
    });

    return {res, email, password, callSign};
};

export const loginUser = (app: FastifyInstance, email: string, password: string): Promise<LightMyRequestResponse> => {
    return app.inject({method: 'POST', url: '/auth/login', payload: {email, password}});
};

export const getRefreshCookie = (res: LightMyRequestResponse): string => {
    const cookie = res.cookies.find(c => c.name === 'refreshToken');
    if (!cookie) throw new Error('refreshToken cookie not set');
    return cookie.value;
};
