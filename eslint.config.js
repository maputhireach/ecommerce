import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			'@typescript-eslint/no-namespace': 'warn',
			'no-restricted-syntax': [
				'warn',
				{
					selector: 'TSEnumDeclaration',
					message:
						'Disallowed by erasable-syntax policy: use union types or const objects instead of enums.',
				},
				{
					selector: 'TSParameterProperty',
					message:
						'Disallowed by erasable-syntax policy: declare parameters and assign to fields explicitly.',
				},
			],
		},
	},
])
