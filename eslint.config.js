import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'legacy-app/', 'legacy/', 'analysis/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      'no-restricted-syntax': [
        'error',
        // Fabric is only reached through the public API: no underscore-prefixed members.
        { selector: 'MemberExpression[property.name=/^_/]', message: 'Private (_-prefixed) members are not allowed.' },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/canvas/**', 'src/export/**', 'src/import/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: [{ name: 'fabric', message: 'Only src/canvas/, src/export/ and src/import/ import fabric.' }] }],
    },
  },
  {
    files: ['scripts/**', '*.config.*'],
    languageOptions: { globals: { ...globals.node } },
  },
);
