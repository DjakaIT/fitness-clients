/**
 * Security-rules tests run against the Firestore emulator, in plain Node —
 * separate from the app suite, which runs under jest-expo with Firebase mocked.
 *
 *   npm run rules:test
 *
 * The backend services are ES modules; transpiling just the module syntax
 * lets these tests run the app's real transaction bodies against the
 * emulator, so the rules are checked against what the app actually writes.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/rules/**/*.test.js"],
  testTimeout: 20000,
  transform: {
    "\\.js$": [
      "babel-jest",
      {
        babelrc: false,
        configFile: false,
        plugins: ["@babel/plugin-transform-modules-commonjs"],
      },
    ],
  },
};
