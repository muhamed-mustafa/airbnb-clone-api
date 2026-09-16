// @ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Match layer aliases, baseUrl imports, and relative paths at any nesting depth.
// Ordinary same-layer imports such as ./foo and ../foo remain valid.
const restrictedLayers = {
  application: ['app', 'presentation', 'infrastructure'],
  presentation: ['app', 'infrastructure'],
  infrastructure: ['app', 'presentation'],
  common: ['app', 'presentation', 'application', 'infrastructure'],
};

// Implementation packages used by the project, not Nest DI or testing utilities.
const applicationRestrictedPackages = [
  '@nestjs/mongoose',
  'mongoose',
  'mongodb',
  '@nestjs/jwt',
  '@nestjs/config',
  'argon2',
  'nestjs-pino',
  'pino',
  'pino-pretty',
  '@nestjs/platform-express',
  'express',
  '@nestjs/swagger',
  'nestjs-i18n',
];

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'lint-staged.config.mjs',
      'commitlint.config.mjs',
      'dist/**',
      'node_modules/**',
      'coverage/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/unbound-method': 'error',
    },
  },
  ...Object.entries(restrictedLayers).map(([layer, forbidden]) => ({
    files: [`src/${layer}/**/*.ts`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...forbidden.map((target) => ({
              regex: `^(?:@|src/|(?:\\.{1,2}/)+(?:src/)?)${target}(?:/|$)`,
              message: `The ${layer} layer must not depend on the ${target} layer.`,
            })),
            ...(layer === 'application'
              ? applicationRestrictedPackages.map((packageName) => ({
                  // Include package subpaths and explicit node_modules relative imports.
                  regex: `^(?:(?:\\.{1,2}/)*node_modules/)?${packageName}(?:/|$)`,
                  message: `The application layer must not depend on ${packageName}. Use an application-owned contract implemented outside the application layer.`,
                }))
              : []),
          ],
        },
      ],
    },
  })),
);
