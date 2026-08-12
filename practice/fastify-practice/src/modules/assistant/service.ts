import type {MessageParam} from '@anthropic-ai/sdk/resources';
import {httpErrors} from '@fastify/sensible';
import type Assistant from '@/common/ai/assistant';
import {type ChatMessage, ChatRole, type ChatSession, type PrismaClient} from '@/database/prisma/client';

class AssistantService {
    private readonly db: PrismaClient;
    private readonly assistant: Assistant;

    public constructor(db: PrismaClient, assistant: Assistant) {
        this.db = db;
        this.assistant = assistant;
    }

    public createChatSession(data: {userId: number}): Promise<ChatSession> {
        return this.db.chatSession.create({data});
    }

    public getChatSessions(userId: number): Promise<ChatSession[]> {
        return this.db.chatSession.findMany({where: {userId}});
    }

    public async getChatSessionMessages(id: number, userId: number): Promise<ChatMessage[]> {
        const session = await this.assertChatSessionOwnership(id, userId);
        return this.db.chatMessage.findMany({where: {sessionId: session.id}});
    }

    public async assertChatSessionOwnership(id: number, userId: number): Promise<ChatSession> {
        const session = await this.db.chatSession.findUniqueOrThrow({where: {id}});
        if (session.userId !== userId) throw httpErrors.notFound();
        return session;
    }

    public async processMessage(
        sessionId: number,
        message: string,
        stormtrooperId: number,
        prompt: string
    ): Promise<string> {
        const contextRaw = await this.getChatContext(sessionId);
        const context = [...contextRaw, {role: ChatRole.user, content: message}];
        const content = await this.assistant.runToolLoop(context, prompt, stormtrooperId);

        await this.db.$transaction([
            this.db.chatMessage.create({data: {sessionId, role: ChatRole.user, content: message}}),
            this.db.chatMessage.create({data: {sessionId, role: ChatRole.assistant, content: content}})
        ]);

        return content;
    }

    private async getChatContext(sessionId: number): Promise<MessageParam[]> {
        const messages = await this.db.chatMessage.findMany({
            where: {sessionId},
            orderBy: {createdAt: 'desc'},
            take: this.assistant.contextWindow
        });

        return this.assistant.buildContext(messages);
    }
}

export default AssistantService;
