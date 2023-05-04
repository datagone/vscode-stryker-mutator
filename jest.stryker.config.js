/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  testRunner: 'jest-circus/runner',
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: [],
};

module.exports = config;
