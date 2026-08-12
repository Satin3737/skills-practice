import type {FastifyInstance} from 'fastify';
import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {ChatRole} from '@/database/prisma/enums';
import {createChatSession, mockAssistantReplies, openChatSocket, waitForMessage} from './helpers/assistant';
import {buildTestApp} from './helpers/build-app';

describe('assistant', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    beforeEach(() => {
        vi.spyOn(app.emailQueue, 'add').mockImplementation(vi.fn());
    });

    afterEach(async () => {
        await app.prisma.user.deleteMany();
        await app.prisma.stormtrooper.deleteMany();
        await app.redisFailFast.flushdb();
        vi.restoreAllMocks();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /assistant/sessions', () => {
        it('rejects without auth', async () => {
            const res = await app.inject({method: 'POST', url: '/assistant/sessions'});

            expect(res.statusCode).toBe(401);
        });

        it('creates a chat session for the caller', async () => {
            const {userId, token} = await createChatSession(app);

            const res = await app.inject({
                method: 'POST',
                url: '/assistant/sessions',
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(201);
            expect(res.json().chatSession).toMatchObject({userId});
        });
    });

    describe('GET /assistant/sessions', () => {
        it('returns only sessions belonging to the caller', async () => {
            const {userId: ownerId, token: ownerToken} = await createChatSession(app, {email: 'owner@rebels.com'});
            await createChatSession(app, {email: 'other@rebels.com'});

            const res = await app.inject({
                method: 'GET',
                url: '/assistant/sessions',
                headers: {authorization: `Bearer ${ownerToken}`}
            });

            expect(res.statusCode).toBe(200);
            const {chatSessions} = res.json();
            expect(chatSessions).toHaveLength(1);
            expect(chatSessions[0].userId).toBe(ownerId);
        });
    });

    describe('GET /assistant/sessions/:id/messages', () => {
        it('rejects without auth', async () => {
            const res = await app.inject({method: 'GET', url: '/assistant/sessions/1/messages'});

            expect(res.statusCode).toBe(401);
        });

        it('returns 404 for a session owned by someone else', async () => {
            const {sessionId} = await createChatSession(app, {email: 'owner2@rebels.com'});
            const {token: intruderToken} = await createChatSession(app, {email: 'intruder@rebels.com'});

            const res = await app.inject({
                method: 'GET',
                url: `/assistant/sessions/${sessionId}/messages`,
                headers: {authorization: `Bearer ${intruderToken}`}
            });

            expect(res.statusCode).toBe(404);
        });

        it('returns the messages for an owned session', async () => {
            const {sessionId, token} = await createChatSession(app, {email: 'chatter@rebels.com'});

            await app.prisma.chatMessage.create({
                data: {sessionId, role: ChatRole.user, content: 'hello there'}
            });

            const res = await app.inject({
                method: 'GET',
                url: `/assistant/sessions/${sessionId}/messages`,
                headers: {authorization: `Bearer ${token}`}
            });

            expect(res.statusCode).toBe(200);
            const {chatMessages} = res.json();
            expect(chatMessages).toHaveLength(1);
            expect(chatMessages[0]).toMatchObject({role: ChatRole.user, content: 'hello there'});
        });
    });

    describe('GET /assistant/sessions/:id/chat (websocket)', () => {
        it('rejects without auth', async () => {
            const res = await app.inject({method: 'GET', url: '/assistant/sessions/1/chat'});

            expect(res.statusCode).toBe(401);
        });

        it('rejects a session owned by someone else', async () => {
            const {sessionId} = await createChatSession(app, {email: 'owner3@rebels.com'});
            const {token: intruderToken} = await createChatSession(app, {email: 'intruder2@rebels.com'});

            const res = await app.inject({
                method: 'GET',
                url: `/assistant/sessions/${sessionId}/chat`,
                headers: {authorization: `Bearer ${intruderToken}`}
            });

            expect(res.statusCode).toBe(404);
        });

        it('replies with the assistant answer and persists both messages', async () => {
            const {sessionId, token} = await createChatSession(app, {email: 'luke2@rebels.com', callSign: 'Red-5'});

            mockAssistantReplies(app, 'Greetings, Red-5!');

            const ws = await openChatSocket(app, sessionId, token);

            const reply = waitForMessage(ws);
            ws.send(JSON.stringify({type: 'message', content: 'hello'}));

            expect(await reply).toEqual({type: 'message', content: 'Greetings, Red-5!'});
            ws.terminate();

            const messages = await app.prisma.chatMessage.findMany({where: {sessionId}, orderBy: {id: 'asc'}});
            expect(messages).toHaveLength(2);
            expect(messages[0]).toMatchObject({role: ChatRole.user, content: 'hello'});
            expect(messages[1]).toMatchObject({role: ChatRole.assistant, content: 'Greetings, Red-5!'});
        });

        it('passes the current message and the caller prompt to the tool loop', async () => {
            const {sessionId, token} = await createChatSession(app, {email: 'han2@smugglers.com', callSign: 'Solo'});

            mockAssistantReplies(app, 'You are Solo, a trooper.');

            const ws = await openChatSocket(app, sessionId, token);

            const reply = waitForMessage(ws);
            ws.send(JSON.stringify({type: 'message', content: 'who am I?'}));

            expect(await reply).toEqual({type: 'message', content: 'You are Solo, a trooper.'});
            expect(app.assistant.runToolLoop).toHaveBeenCalledTimes(1);
            const [context, prompt] = vi.mocked(app.assistant.runToolLoop).mock.calls[0];
            expect(context.at(-1)).toMatchObject({role: ChatRole.user, content: 'who am I?'});
            expect(prompt).toContain('Solo');
            ws.terminate();
        });

        it('responds with an error for a malformed message', async () => {
            const {sessionId, token} = await createChatSession(app, {email: 'leia2@rebels.com'});

            const ws = await openChatSocket(app, sessionId, token);

            const reply = waitForMessage(ws);
            ws.send(JSON.stringify({content: 'missing the type field'}));

            expect(await reply).toEqual({type: 'error', content: 'Invalid message format.'});
            ws.terminate();
        });

        it('responds with an error and persists nothing when the tool loop rejects', async () => {
            const {sessionId, token} = await createChatSession(app, {email: 'vader2@empire.com'});

            vi.spyOn(app.assistant, 'runToolLoop').mockReset().mockRejectedValueOnce(new Error('boom'));

            const ws = await openChatSocket(app, sessionId, token);

            const reply = waitForMessage(ws);
            ws.send(JSON.stringify({type: 'message', content: 'loop forever'}));

            expect(await reply).toEqual({type: 'error', content: 'An error occurred while processing your request.'});
            ws.terminate();

            const messages = await app.prisma.chatMessage.findMany({where: {sessionId}});
            expect(messages).toHaveLength(0);
        });
    });
});
