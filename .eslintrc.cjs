// Rotens eslint-config. Filen MÅSTE heta .cjs — package.json har
// "type": "module", och en .eslintrc.js läses då som ESM och kraschar.
//
// Prettier är MEDVETET inte med här. eslint-config-prettier och
// eslint-plugin-prettier är inte installerade i något workspace, och den
// tidigare configen refererade dem ändå — vilket gjorde att lint inte gick att
// köra alls. Formatering är ett eget beslut, se docs/TODO.md.
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    'no-console': 'warn',
    'no-debugger': 'error',
  },
  ignorePatterns: ['dist/', 'build/', 'node_modules/', '*.js', '*.cjs'],
};
