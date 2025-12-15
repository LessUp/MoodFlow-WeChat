module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.cache/',
    '.vite/',
    'apps/**/.vite/',
    'apps/**/dist/',
    'packages/**/dist/',
    'miniprogram_npm/',
    'apps/miniprogram/miniprogram_npm/',
    '**/miniprogram_npm/'
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        ]
      }
    },
    {
      files: ['**/*.js', '**/*.cjs'],
      extends: ['eslint:recommended'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      env: {
        es2020: true,
        node: true
      },
      globals: {
        App: 'readonly',
        Page: 'readonly',
        Component: 'readonly',
        Behavior: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
        wx: 'readonly'
      },
      rules: {
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        ]
      }
    }
  ]
};
