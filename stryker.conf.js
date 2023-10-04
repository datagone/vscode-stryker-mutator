/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  ignorePatterns: ['**/*', '!*.{ts,js}', '!*.json', '!__mocks__/**/*', '!src/**/*'],
  mutate: ['{src,lib}/**/*.{ts,js}', '!{src,lib}/**/?(*.)+(spec|test|interface).{ts,js}', '!src/test-helpers.ts'],
  testRunner: 'jest',
  packageManager: 'npm',
  checkers: ['typescript'],
  reporters: ['html', 'clear-text', 'progress'],
  tsconfigFile: 'tsconfig.json',
  timeoutMS: 60000,
  thresholds: { high: 100, low: 100, break: 100 },
  jest: {
    configFile: './jest.stryker.config.js',
  },
};
