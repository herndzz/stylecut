/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/server/tests/**/*.test.js'],
  clearMocks: true,
  verbose: false,
};
