import {Type} from '@fastify/type-provider-typebox';
import {byIdPSchema} from '@/common/schemas';
import {ChatMessagePlain} from '@/database/prismabox/ChatMessage';
import {ChatSessionPlain} from '@/database/prismabox/ChatSession';
import {SocketMessageType} from './const';

export const createChatSessionSchema = {
    response: {
        201: Type.Object({chatSession: ChatSessionPlain})
    }
};

export const getChatSessionsSchema = {
    response: {
        200: Type.Object({chatSessions: Type.Array(ChatSessionPlain)})
    }
};

export const getChatMessagesSchema = {
    params: byIdPSchema,
    response: {
        200: Type.Object({chatMessages: Type.Array(ChatMessagePlain)})
    }
};

export const getSessionsChatSchema = {
    params: byIdPSchema
};

export const socketMessageSchema = Type.Object({
    type: Type.Enum(SocketMessageType),
    content: Type.String()
});
