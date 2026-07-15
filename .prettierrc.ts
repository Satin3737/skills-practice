import type {Config} from 'prettier';

const config: Config = {
    $schema: 'https://json.schemastore.org/prettierrc',
    semi: true,
    tabWidth: 4,
    singleQuote: true,
    printWidth: 120,
    trailingComma: 'none',
    bracketSpacing: false,
    arrowParens: 'avoid',
    importOrder: ['^dotenv/config', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./(.*)$]'],
    importOrderSortSpecifiers: true,
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    plugins: ['@trivago/prettier-plugin-sort-imports']
};

export default config;
