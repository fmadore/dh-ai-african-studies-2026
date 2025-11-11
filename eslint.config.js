import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import globals from 'globals';

const tsConfigs = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ['**/*.{ts,tsx,cts,mts}']
}));

export default [
  {
    ignores: ['.svelte-kit/**', 'build/**', 'dist/**', 'node_modules/**']
  },
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        svelteFeatures: {
          experimentalRunes: true
        }
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'svelte/no-at-html-tags': 'error'
    }
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  ...tsConfigs,
  js.configs.recommended
];
