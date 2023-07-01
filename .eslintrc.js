module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: { ecmaVersion: 8 }, // to enable features such as async/await
  ignorePatterns: [
    'node_modules/*',
    '.build/*',
    '!.prettierrc.js',
    'jest.setup.js',
  ], // We don't want to lint generated files nor node_modules, but we want to lint .prettierrc.js (ignored by default by eslint)
  extends: ['eslint:recommended'],
  overrides: [
    // This configuration will apply only to TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // TypeScript rules
        'plugin:prettier/recommended',
      ],
      plugins: ['simple-import-sort', 'import'],
      rules: {

        // Why would you want unused vars?
        '@typescript-eslint/no-unused-vars': ['error'],

        'prettier/prettier': ['error', {}, { usePrettierrc: true }],
        'jsx-a11y/no-onchange': 0,
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        // I suggest this setting for requiring return types on functions only where useful
        '@typescript-eslint/explicit-function-return-type': [
          'warn',
          {
            allowExpressions: true,
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          },
        ],
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal'],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
      },
    },
  ],
};
