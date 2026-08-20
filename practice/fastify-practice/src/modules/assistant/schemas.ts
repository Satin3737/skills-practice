import {z} from 'zod';
import {byIdPSchema} from '@/common/schemas';
import {ChatMessagePlain, ChatSessionPlain} from '@/database/models';
import {SocketMessageType} from './const';

export const createChatSessionSchema = {
    response: {
        201: z.object({chatSession: ChatSessionPlain})
    }
};

export const getChatSessionsSchema = {
    response: {
        200: z.object({chatSessions: z.array(ChatSessionPlain)})
    }
};

export const getChatMessagesSchema = {
    params: byIdPSchema,
    response: {
        200: z.object({chatMessages: z.array(ChatMessagePlain)})
    }
};

export const getSessionsChatSchema = {
    params: byIdPSchema
};

export const socketMessageSchema = z.object({
    type: z.enum(SocketMessageType),
    content: z.string()
});
