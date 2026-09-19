/**
 * Security-rules tests run against the Firestore emulator, in plain Node —
 * separate from the app suite, which runs under jest-expo with Firebase mocked.
 *
 *   npm run rules:test
 *
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/rules/**/*.test.js"],
  testTimeout: 20000,
};
