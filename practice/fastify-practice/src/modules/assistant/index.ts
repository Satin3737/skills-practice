import type {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {Check} from 'typebox/value';
import {MaxToolIterationsError} from '@/common/ai/errors';
import {UserRank} from '@/database/prisma/enums';
import {SocketMessageType} from './const';
import {
    createChatSessionSchema,
    getChatMessagesSchema,
    getChatSessionsSchema,
    getSessionsChatSchema,
    socketMessageSchema
} from './schemas';
import AssistantService from './service';

const assistant: FastifyPluginAsyncTypebox = async (fastify): Promise<void> => {
    const assistant = fastify.assistant;
    const assistantService = new AssistantService(fastify.prisma, assistant);
    const usersService = fastify.usersService;

    fastify.addHook('onRequest', fastify.authGuard(UserRank.trooper));

    fastify.post('/sessions', {schema: createChatSessionSchema}, async (req, res): Promise<void> => {
        res.code(201).send({chatSession: await assistantService.createChatSession({userId: req.user.id})});
    });

    fastify.get('/sessions', {schema: getChatSessionsSchema}, async (req, res): Promise<void> => {
        res.code(200).send({chatSessions: await assistantService.getChatSessions(req.user.id)});
    });

    fastify.get('/sessions/:id/messages', {schema: getChatMessagesSchema}, async (req, res): Promise<void> => {
        res.code(200).send({chatMessages: await assistantService.getChatSessionMessages(req.params.id, req.user.id)});
    });

    fastify.get(
        '/sessions/:id/chat',
        {
            schema: getSessionsChatSchema,
            websocket: true,
            preHandler: async req => await assistantService.assertChatSessionOwnership(req.params.id, req.user.id)
        },
        async (socket, req): Promise<void> => {
            const sessionId = req.params.id;

            const sessionContextPromise = usersService.getCurrentUser(req.user.id).then(user => ({
                stormtrooperId: user.stormtrooperId,
                prompt: assistant.buildPrompt(user.stormtrooper.callSign, user.rank)
            }));

            socket.on('message', async message => {
                try {
                    const {stormtrooperId, prompt} = await sessionContextPromise;
                    const parsedMessage = JSON.parse(message.toString());

                    if (!Check(socketMessageSchema, parsedMessage)) {
                        return socket.send(
                            JSON.stringify({
                                type: SocketMessageType.error,
                                content: 'Invalid message format.'
                            })
                        );
                    }

                    const content = await assistantService.processMessage(
                        sessionId,
                        parsedMessage.content,
                        stormtrooperId,
                        prompt
                    );

                    socket.send(JSON.stringify({type: SocketMessageType.message, content}));
                } catch (error) {
                    fastify.log.error(error);

                    socket.send(
                        JSON.stringify({
                            type: SocketMessageType.error,
                            content:
                                error instanceof MaxToolIterationsError
                                    ? 'Maximum iterations reached. Please try again.'
                                    : 'An error occurred while processing your request.'
                        })
                    );
                }
            });
        }
    );
};

export default assistant;
