/* eslint-env jest */

// The tenant config reads its admin list from the environment at import time,
// so it has to be set before any module under test is required.
process.env.EXPO_PUBLIC_ADMIN_EMAIL = "trainer@example.com";

// Firebase is never reached in unit tests — every module that touches it is
// either injected with a fake or mocked per-suite. This stub keeps the import
// graph loadable without real credentials.
jest.mock("./backend/config/firebase", () => ({
  auth: {},
  db: {},
}));

// The Firebase SDK ships ESM that Metro handles but Jest would have to
// transpile on every run. Suites that exercise Firestore replace these with
// their own factories; everything else just needs the import to resolve.
jest.mock("firebase/app", () => ({ initializeApp: jest.fn(() => ({})) }));

jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signOut: jest.fn().mockResolvedValue(undefined),
  signInWithCredential: jest.fn().mockResolvedValue({}),
  GoogleAuthProvider: { credential: jest.fn(() => ({})) },
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn((_db, name) => ({ name })),
  doc: jest.fn((_db, name, id) => ({ name, id, path: `${name}/${id}` })),
  query: jest.fn((...args) => args),
  where: jest.fn((...args) => args),
  orderBy: jest.fn((...args) => args),
  limit: jest.fn((...args) => args),
  onSnapshot: jest.fn(() => jest.fn()),
  getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
  getDocs: jest.fn().mockResolvedValue({ docs: [] }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  addDoc: jest.fn().mockResolvedValue({ id: "new" }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  runTransaction: jest.fn(),
  writeBatch: jest.fn(),
  serverTimestamp: jest.fn(() => "SERVER_TS"),
}));

// Native modules have no implementation under the jest environment.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native-webview", () => ({ WebView: "WebView" }));

// Reanimated 4 boots its native worklets core at import time, which has no
// implementation here. Mock the core first, then use Reanimated's own mock.
jest.mock("react-native-worklets", () =>
  require("react-native-worklets/src/mock"),
);

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
    IN_PROGRESS: "IN_PROGRESS",
    PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
  },
}));

// Keep the test output readable: suites that expect a logged error assert on
// the spy instead.
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
