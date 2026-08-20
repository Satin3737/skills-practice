import {defineConfig} from 'oxlint';

export default defineConfig({
    plugins: ['typescript', 'oxc'],
    categories: {
        correctness: 'error'
    },
    env: {
        builtin: true,
        browser: true
    },
    ignorePatterns: ['dist', '__generated__'],
    rules: {
        'no-unused-expressions': ['error', {allowShortCircuit: true, allowTernary: true}],
        'no-unused-vars': [
            'warn',
            {
                args: 'after-used',
                argsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
                ignoreRestSiblings: true
            }
        ],
        'typescript/no-explicit-any': ['error', {ignoreRestArgs: true}],
        'typescript/no-duplicate-enum-values': 'off'
    }
});
