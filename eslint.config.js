import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

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
			// JSON-LD script injection is intentional and safe (static site, trusted data)
			'svelte/no-at-html-tags': 'off',
			// Custom resolveAppPath/resolveAssetPath helpers handle base path resolution
			'svelte/no-navigation-without-resolve': 'off',
			// Allow each blocks without keys where order is stable
			'svelte/require-each-key': 'warn'
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
	js.configs.recommended,
	// Disable ESLint rules that conflict with Prettier formatting.
	// Must come after all base configs, before custom rule overrides.
	prettier,
	// Overrides after all base configs so they take precedence
	{
		files: ['**/*.svelte'],
		rules: {
			// Allow _-prefixed unused vars (common in type annotations and snippets)
			'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
		}
	},
	{
		files: ['**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			globals: {
				...globals.browser,
				$state: 'readonly',
				$derived: 'readonly',
				$effect: 'readonly',
				$props: 'readonly',
				$bindable: 'readonly',
				$inspect: 'readonly',
				$host: 'readonly'
			}
		},
		rules: {
			'prefer-const': 'off'
		}
	},
	{
		files: ['**/*.d.ts'],
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	}
];
