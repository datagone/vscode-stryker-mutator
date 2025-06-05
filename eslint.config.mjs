import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  globalIgnores(['**/out', '**/dist', '**/*.d.ts', '**/report', '**/node_modules', '**/coverage', '**/.stryker-tmp']),
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 6,
      sourceType: 'module',
    },

    rules: {
      eqeqeq: 'warn',
      'no-throw-literal': 'warn',
      semi: 'warn',
    },
  },
]);
