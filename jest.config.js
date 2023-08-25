module.exports = {
  testRunner: 'jest-circus/runner',
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/test/**/*', '!src/**/*.test.ts'],
  coverageDirectory: './reports/coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testPathIgnorePatterns: ['node_modules/', 'src/test/*', '.stryker-tmp/*', 'dist/', 'reports/'],
  reporters: ['default'],
  clearMocks: true,
};
