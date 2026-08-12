import fp from 'fastify-plugin';
import Assistant from '@/common/ai/assistant';

const aiPlugin = fp(
    async fastify => {
        fastify.decorate(
            'assistant',
            new Assistant({
                apiKey: fastify.config.ANTHROPIC_API_KEY,
                contextWindow: fastify.config.ASSISTANT_CONTEXT_WINDOW,
                model: fastify.config.ANTHROPIC_MODEL,
                maxTokens: fastify.config.ASSISTANT_MAX_TOKENS,
                services: {
                    stormtroopersService: fastify.stormtroopersService,
                    missionsService: fastify.missionsService,
                    weaponsService: fastify.weaponsService
                }
            })
        );
    },
    {name: 'ai', dependencies: ['env', 'services']}
);

export default aiPlugin;
