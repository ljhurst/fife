import eslint from '@eslint/js';
import astroParser from 'astro-eslint-parser';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginImport from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default [
    {
        files: ['**/*.{js,ts,tsx,astro}'],
        plugins: {
            import: eslintPluginImport,
        },
        ...eslint.configs.recommended,
        rules: {
            'no-trailing-spaces': 'error',
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'eol-last': ['error', 'always'],
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            'comma-dangle': ['error', 'always-multiline'],
            indent: ['error', 4],
            'no-unused-vars': 'error',
            'max-len': ['error', { code: 100 }],
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc' },
                },
            ],
            'import/no-duplicates': 'error',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        ...tseslint.configs.recommended[0],
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
        },
    },
    {
        files: ['**/*.astro'],
        plugins: {
            astro: eslintPluginAstro,
        },
        languageOptions: {
            parser: astroParser,
            parserOptions: {
                parser: '@typescript-eslint/parser',
                extraFileExtensions: ['.astro'],
                sourceType: 'module',
            },
        },
        rules: {
            ...eslintPluginAstro.configs.recommended.rules,
            'astro/no-conflict-set-directives': 'error',
            'astro/no-unused-define-vars-in-style': 'error',
            'astro/prefer-split-class-list': 'error',
            'astro/no-unused-css-selector': 'error',
            'astro/valid-compile': 'error',
        },
    },

    {
        ignores: ['.astro', 'dist/', 'node_modules/'],
    },
];
