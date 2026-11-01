import type {Anthropic} from '@anthropic-ai/sdk';
import type {Message, MessageParam} from '@anthropic-ai/sdk/resources';
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

        it('keeps the history in insertion order when timestamps are equal', async () => {
            const {sessionId, token} = await createChatSession(app, {email: 'history@empire.com'});
            const createdAt = new Date();
            await app.prisma.chatMessage.createMany({
                data: [
                    {sessionId, role: ChatRole.user, content: 'question', createdAt},
                    {sessionId, role: ChatRole.assistant, content: 'answer', createdAt}
                ]
            });

            mockAssistantReplies(app, 'ok');

            const ws = await openChatSocket(app, sessionId, token);

            const reply = waitForMessage(ws);
            ws.send(JSON.stringify({type: 'message', content: 'follow-up'}));
            await reply;
            ws.terminate();

            const [context] = vi.mocked(app.assistant.runToolLoop).mock.calls[0];
            expect(context.map(m => m.content)).toEqual(['question', 'answer', 'follow-up']);
        });

        it('rejects a message longer than the limit', async () => {
            const {sessionId, token} = await createChatSession(app, {email: 'spam@empire.com'});
            const spy = vi.spyOn(app.assistant, 'runToolLoop').mockReset();

            const ws = await openChatSocket(app, sessionId, token);

            const reply = waitForMessage(ws);
            ws.send(JSON.stringify({type: 'message', content: 'x'.repeat(4001)}));

            expect(await reply).toEqual({type: 'error', content: 'Invalid message format.'});
            expect(spy).not.toHaveBeenCalled();
            ws.terminate();
        });

        it('rejects a new message while the previous one is still being processed', async () => {
            const {sessionId, token} = await createChatSession(app, {email: 'eager@empire.com'});
            const {promise, resolve} = Promise.withResolvers<string>();
            const spy = vi.spyOn(app.assistant, 'runToolLoop').mockReset().mockReturnValueOnce(promise);

            const ws = await openChatSocket(app, sessionId, token);

            const busyReply = waitForMessage(ws);
            ws.send(JSON.stringify({type: 'message', content: 'first'}));
            ws.send(JSON.stringify({type: 'message', content: 'second'}));
            expect(await busyReply).toEqual({type: 'error', content: 'Please wait for the previous reply.'});

            const reply = waitForMessage(ws);
            resolve('done');
            expect(await reply).toEqual({type: 'message', content: 'done'});
            expect(spy).toHaveBeenCalledTimes(1);
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

    describe('Assistant.runToolLoop', () => {
        it('reports a failed tool as an error result instead of throwing', async () => {
            const {messages} = (app.assistant as unknown as {client: Anthropic}).client;
            const create = vi
                .spyOn(messages, 'create')
                .mockResolvedValueOnce({
                    stop_reason: 'tool_use',
                    content: [{type: 'tool_use', id: 'tool-1', name: 'get_weapon_info', input: {weaponId: 999999}}]
                } as unknown as Message)
                .mockResolvedValueOnce({
                    stop_reason: 'end_turn',
                    content: [{type: 'text', text: 'No such weapon, I am afraid.'}]
                } as unknown as Message);

            const reply = await app.assistant.runToolLoop([{role: 'user', content: 'weapon 999999?'}], 'prompt', 1);

            expect(reply).toBe('No such weapon, I am afraid.');
            const [{messages: sent}] = create.mock.calls[1] as unknown as [{messages: MessageParam[]}];
            expect(sent.at(-1)?.content).toEqual([expect.objectContaining({tool_use_id: 'tool-1', is_error: true})]);
        });
    });
});
