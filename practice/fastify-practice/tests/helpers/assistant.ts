import type {FastifyInstance} from 'fastify';
import type {Socket} from 'net';
import {vi} from 'vitest';
import {UserRank} from '@/database/prisma/enums';
import type {IRegisterUserData} from '@/modules/auth/types';
import {registerUser} from './auth';
import {signAccessToken} from './jwt';

export const mockAssistantReplies = (app: FastifyInstance, ...replies: string[]): void => {
    const spy = vi.spyOn(app.assistant, 'runToolLoop').mockReset();
    for (const reply of replies) spy.mockResolvedValueOnce(reply);
};

export const waitForMessage = (
    ws: Awaited<ReturnType<FastifyInstance['injectWS']>>
): Promise<{type: string; content: string}> => {
    return new Promise(resolve => {
        ws.once('message', data => resolve(JSON.parse(data.toString())));
    });
};

export const openChatSocket = (app: FastifyInstance, sessionId: number, token: string) => {
    return app.injectWS(`/assistant/sessions/${sessionId}/chat`, {
        headers: {authorization: `Bearer ${token}`},
        socket: {remoteAddress: '127.0.0.1'} as unknown as Socket
    });
};

export const createChatSession = async (
    app: FastifyInstance,
    opts: Partial<IRegisterUserData> = {}
): Promise<{userId: number; token: string; sessionId: number}> => {
    const {res: registerRes} = await registerUser(app, opts);
    const userId = registerRes.json().user.id;
    const token = signAccessToken(app, UserRank.trooper, userId);

    const sessionRes = await app.inject({
        method: 'POST',
        url: '/assistant/sessions',
        headers: {authorization: `Bearer ${token}`}
    });

    return {userId, token, sessionId: sessionRes.json().chatSession.id};
};
