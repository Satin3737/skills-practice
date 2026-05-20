import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: './src/graphql/schema.ts',
    documents: ['src/graphql/**/*.graphql'],
    generates: {
        './src/__generated__/': {
            preset: 'client',
            presetConfig: {
                gqlTagName: 'graphql'
            },
            config: {
                useTypeImports: true
            }
        },
        './src/__generated__/resolvers.ts': {
            plugins: ['typescript', 'typescript-resolvers'],
            config: {
                useTypeImports: true
            }
        }
    }
};

export default config;
