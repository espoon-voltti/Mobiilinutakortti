// SPDX-FileCopyrightText: 2025-2025 City of Espoo
//
// SPDX-License-Identifier: LGPL-2.1-or-later

import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default [
  { ignores: ['.yarn', 'dist', 'src/*/generated'] },
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommendedTypeChecked,
  ...typescriptEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        globals: globals.browser,
      },
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    ...typescriptEslint.configs.disableTypeChecked,
  },
  // Registered directly rather than via importX.flatConfigs.typescript: that
  // preset points import-x at the `typescript` resolver, which is not installed
  // and would warn on every file. It has nothing to resolve here anyway -- this
  // package has no tsconfig.json and no .ts/.tsx sources. `order` is the only
  // import-x rule we enable and needs no resolver settings.
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    plugins: { 'import-x': importX },
    rules: {
      'import-x/order': [
        'warn',
        {
          alphabetize: { order: 'asc' },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'arrow-body-style': ['error', 'as-needed'],
      'no-constant-binary-expression': ['error'],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^.*',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  // eslint-plugin-react has no eslint 10 support (it is capped at ^9.7 and its
  // latest release still calls rule-context methods eslint 10 removed), so the
  // React rules come from @eslint-react instead. The two stylistic rules we had
  // -- react/jsx-curly-brace-presence and react/self-closing-comp -- have no
  // equivalent there; @eslint-react is correctness-focused, not stylistic.
  {
    files: ['**/*.{ts,tsx}'],
    ...eslintReact.configs['recommended-typescript'],
  },
  // eslint-plugin-react-hooks stays the authority on hooks -- it is the React
  // team's own plugin and already supports eslint 10. @eslint-react ships its
  // own copies of these nine rules, so switch those off: otherwise both plugins
  // report the same problem, and the deliberate opt-outs below (react-hooks/refs,
  // set-state-in-effect, static-components, preserve-manual-memoization) would be
  // silently undone by their @eslint-react twins. The list is @eslint-react's own
  // declared conflict set, intersected with what recommended-typescript enables.
  //
  // Note: @eslint-react also ships configs/disable-conflict-eslint-plugin-react-hooks,
  // but that resolves the overlap the other way -- it disables react-hooks/*.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@eslint-react/error-boundaries': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@eslint-react/purity': 'off',
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/set-state-in-render': 'off',
      '@eslint-react/static-components': 'off',
      '@eslint-react/unsupported-syntax': 'off',
      '@eslint-react/use-memo': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/static-components': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'always' },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  eslintPluginPrettierRecommended,
];
