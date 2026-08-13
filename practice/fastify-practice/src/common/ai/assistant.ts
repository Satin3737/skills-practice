import {APIPromise, Anthropic} from '@anthropic-ai/sdk';
import type {Message, MessageParam, ToolResultBlockParam, ToolUseBlock} from '@anthropic-ai/sdk/resources';
import {Check} from 'typebox/value';
import {type ChatMessage, ChatRole} from '@/database/prisma/client';
import type {UserRank} from '@/database/prisma/enums';
import type MissionsService from '@/modules/missions/service';
import type StormtroopersService from '@/modules/stormtroopers/service';
import type WeaponsService from '@/modules/weapons/service';
import {MaxToolIterationsError} from './errors';
import {Tools, allTools, getMyStormtrooperDataTool, getWeaponInfoTool, listMyMissionsTool} from './tools';
import type {IToolExecs, IToolHandlers, ITools} from './types';

class Assistant {
    public readonly contextWindow: number;

    private readonly client: Anthropic;
    private readonly model: string;
    private readonly maxTokens: number;
    private readonly maxIterations: number = 5;

    private readonly services: {
        weaponsService: WeaponsService;
        missionsService: MissionsService;
        stormtroopersService: StormtroopersService;
    };

    public constructor({
        apiKey,
        contextWindow,
        model,
        maxTokens,
        services
    }: {
        apiKey: string;
        contextWindow: number;
        model: string;
        maxTokens: number;
        services: {
            weaponsService: WeaponsService;
            missionsService: MissionsService;
            stormtroopersService: StormtroopersService;
        };
    }) {
        this.client = new Anthropic({apiKey});
        this.contextWindow = contextWindow;
        this.model = model;
        this.maxTokens = maxTokens;
        this.services = services;
    }

    private readonly toolHandlers: IToolHandlers = {
        [Tools.listMyMissions]: this.execListMyMissions,
        [Tools.getMyData]: this.execGetMyStormtrooperData,
        [Tools.getWeaponInfo]: this.execGetWeaponInfo
    };

    public buildPrompt(callSign: string, rank: UserRank): string {
        return `        
            You are C-3PO, protocol droid of the Galactic Empire, fluent in over six million forms of communication and permanently assigned as an instructor and assistant to Imperial stormtroopers.
            
            You are speaking with ${callSign}, who holds the rank of ${rank}.
            
            Personality: courteous, formal, and a little anxious, prone to fretting about odds and protocol, but unfailingly loyal and eager to help. Address the user by their call sign. Never break character.
            
            Scope of duties: you help with questions about missions, weapons, and stormtrooper records within the Empire's systems. You may use the tools available to you to look up real data before answering - never invent mission briefings, weapon stats, or stormtrooper records. If a tool returns no data, say so plainly instead of guessing.
            
            Boundaries: politely decline requests unrelated to the Empire's missions, weapons, or stormtrooper affairs, redirecting the user back to matters within your expertise. You do not have the authority to create, modify, or delete any records - you may only look things up and report on them.
        `;
    }

    public buildContext(messages: ChatMessage[]): MessageParam[] {
        return messages.toReversed().map(message => ({
            role: message.role,
            content: message.content
        }));
    }

    public async runToolLoop(context: MessageParam[], prompt: string, stormtrooperId: number): Promise<string> {
        const reasonStr = 'tool_use' as const;
        const resultStr = 'tool_result' as const;

        let messages = context;
        let response = await this.createMessage({prompt, context});

        for (let i = 0; i < this.maxIterations && response.stop_reason === reasonStr; i++) {
            const toolUseBlocks = response.content.filter((block): block is ToolUseBlock & {name: ITools} => {
                return block.type === reasonStr && this.isToolName(block.name);
            });

            const toolResults: ToolResultBlockParam[] = await Promise.all(
                toolUseBlocks.map(async block => {
                    const toolResult = await this.validateToolInput({
                        name: block.name,
                        input: block.input,
                        stormtrooperId
                    });

                    return {
                        type: resultStr,
                        tool_use_id: block.id,
                        content: JSON.stringify(toolResult)
                    };
                })
            );

            messages = [
                ...messages,
                {role: ChatRole.assistant, content: response.content},
                {role: ChatRole.user, content: toolResults}
            ];

            response = await this.createMessage({prompt, context: messages});
        }

        if (response.stop_reason === reasonStr) throw new MaxToolIterationsError();

        return response.content.map(block => (block.type === 'text' ? block.text : '')).join('\n');
    }

    private createMessage({prompt, context}: {prompt: string; context: MessageParam[]}): APIPromise<Message> {
        return this.client.messages.create({
            system: prompt,
            messages: context,
            model: this.model,
            max_tokens: this.maxTokens,
            tools: allTools
        });
    }

    private isToolName(name: string): name is ITools {
        return Object.values<string>(Tools).includes(name);
    }

    private validateToolInput<T extends ITools>({
        name,
        input,
        stormtrooperId
    }: {
        name: T;
        input: unknown;
        stormtrooperId: number;
    }): IToolExecs[T]['res'] | null {
        switch (name) {
            case Tools.getWeaponInfo: {
                if (!Check(getWeaponInfoTool.input_schema, input)) return null;

                return this.executeTool(Tools.getWeaponInfo, {
                    input: input,
                    weaponsService: this.services.weaponsService
                });
            }

            case Tools.listMyMissions: {
                if (!Check(listMyMissionsTool.input_schema, input)) return null;

                return this.executeTool(Tools.listMyMissions, {
                    input,
                    context: {stormtrooperId},
                    missionsService: this.services.missionsService
                });
            }

            case Tools.getMyData: {
                if (!Check(getMyStormtrooperDataTool.input_schema, input)) return null;

                return this.executeTool(Tools.getMyData, {
                    context: {stormtrooperId},
                    stormtroopersService: this.services.stormtroopersService
                });
            }
        }
    }

    private executeTool<T extends ITools>(name: T, params: IToolExecs[T]['params']): IToolExecs[T]['res'] {
        return this.toolHandlers[name](params);
    }

    private execListMyMissions({
        missionsService,
        input,
        context
    }: IToolExecs[typeof Tools.listMyMissions]['params']): IToolExecs[typeof Tools.listMyMissions]['res'] {
        return missionsService.getMissionsByStormtrooperId(context.stormtrooperId, input.onlyIncomplete);
    }

    private execGetMyStormtrooperData({
        stormtroopersService,
        context
    }: IToolExecs[typeof Tools.getMyData]['params']): IToolExecs[typeof Tools.getMyData]['res'] {
        return stormtroopersService.getStormtrooperById(context.stormtrooperId);
    }

    private execGetWeaponInfo({
        weaponsService,
        input
    }: IToolExecs[typeof Tools.getWeaponInfo]['params']): IToolExecs[typeof Tools.getWeaponInfo]['res'] {
        return weaponsService.getWeaponById(input.weaponId);
    }
}

export default Assistant;
