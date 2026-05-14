module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  ignorePatterns: ['/_design/**', '/dist/**'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
