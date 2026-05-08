import js from '@eslint/js';
import type {Linter} from 'eslint';
import {defineConfig, globalIgnores} from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const customEsLintSettings: Linter.RulesRecord = {
    '@typescript-eslint/no-unused-expressions': ['error', {allowShortCircuit: true, allowTernary: true}],
    '@typescript-eslint/no-unused-vars': [
        'warn',
        {argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', args: 'after-used', ignoreRestSiblings: true}
    ],
    '@typescript-eslint/no-explicit-any': ['error', {ignoreRestArgs: true}],
    '@typescript-eslint/no-duplicate-enum-values': 'off',
    '@typescript-eslint/member-ordering': [
        'warn',
        {
            default: [
                'static-field',
                'public-instance-field',
                'protected-instance-field',
                'private-instance-field',
                'constructor',
                ['public-get', 'public-set'],
                'public-method',
                ['protected-get', 'protected-set'],
                'protected-method',
                ['private-get', 'private-set'],
                'private-method'
            ]
        }
    ]
};

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {ecmaVersion: 2020, globals: globals.browser},
        rules: customEsLintSettings
    }
]);
