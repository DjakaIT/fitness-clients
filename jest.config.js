/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/__tests__/**/*.test.{js,jsx}"],
  collectCoverageFrom: [
    "backend/**/*.js",
    "src/hooks/**/*.jsx",
    "src/context/**/*.jsx",
    "!backend/data/**",
    "!backend/config/firebase.js",
  ],
  // Tiered on purpose. The domain layer decides who may book what and when, so
  // it is held near-total; the hook layer is mostly Firestore plumbing, where a
  // high bar would buy mock-shaped tests rather than confidence.
  coverageThreshold: {
    "./backend/utils/": {
      statements: 95,
      branches: 85,
      functions: 95,
      lines: 95,
    },
    "./backend/services/": {
      statements: 100,
      branches: 95,
      functions: 100,
      lines: 100,
    },
    "./src/hooks/": { statements: 55, branches: 50, functions: 45, lines: 55 },
  },
  // The leading [/\\] matters on Windows: Jest matches these patterns against
  // native paths, so a "/"-only pattern silently stops transforming anything.
  transformIgnorePatterns: [
    "node_modules[/\\\\](?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?[/\\\\].*|@expo-google-fonts[/\\\\].*|react-navigation|@react-navigation[/\\\\].*|@unimodules[/\\\\].*|unimodules|sentry-expo|native-base|react-native-svg|react-native-calendars|react-native-reanimated|phosphor-react-native|firebase|@firebase[/\\\\].*))",
  ],
};
