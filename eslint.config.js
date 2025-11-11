import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    ignores: ['.svelte-kit/**', 'build/**', 'dist/**', 'node_modules/**']
  },
  {
    files: ['**/*.{js,ts,svelte}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        svelteFeatures: {
          experimentalRunes: true
        }
      }
    },
    rules: {
      'svelte/no-at-html-tags': 'error'
    }
  },
  ...tseslint.configs.recommended,
  js.configs.recommended
];
