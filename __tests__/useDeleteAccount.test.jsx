import { renderHook, act } from "@testing-library/react-native";

const order = [];
const mockUser = {
  uid: "u1",
  providerData: [{ providerId: "google.com" }],
  getIdToken: jest.fn(async () => "id-token"),
};

jest.mock("../backend/config/firebase", () => ({
  auth: { currentUser: null, app: { options: { apiKey: "key" } } },
  db: {},
}));

const mockReauth = jest.fn(async () => order.push("reauth"));
const mockDeleteUser = jest.fn(async () => order.push("deleteUser"));
const mockSignOut = jest.fn(async () => order.push("signOut"));
jest.mock("firebase/auth", () => ({
  reauthenticateWithCredential: (...a) => mockReauth(...a),
  deleteUser: (...a) => mockDeleteUser(...a),
  signOut: (...a) => mockSignOut(...a),
}));

const mockDeleteOwnData = jest.fn(async () => {
  order.push("data");
  return { released: 0, kept: [] };
});
jest.mock("../backend/services/accountDeletion", () => ({
  deleteOwnData: (...a) => mockDeleteOwnData(...a),
  deleteClientDataAsTrainer: jest.fn(),
}));

const mockRequestGoogle = jest.fn(async () => ({ provider: "google" }));
const mockRevokeAccess = jest.fn(async () => order.push("googleRevoke"));
jest.mock("../src/hooks/auth/googleSignin", () => ({
  requestGoogleCredential: (...a) => mockRequestGoogle(...a),
  getGoogleSignin: () => ({
    GoogleSignin: {
      revokeAccess: (...a) => mockRevokeAccess(...a),
      signOut: jest.fn(async () => {}),
    },
  }),
}));

const mockRequestApple = jest.fn(async () => ({
  credential: { provider: "apple" },
  authorizationCode: "apple-code",
}));
const mockRevokeApple = jest.fn(async () => order.push("appleRevoke"));
jest.mock("../src/hooks/auth/appleCredential", () => ({
  requestAppleCredential: (...a) => mockRequestApple(...a),
  revokeAppleAuthorization: (...a) => mockRevokeApple(...a),
}));

const { auth } = require("../backend/config/firebase");
const { SignInCancelledError } = require("../src/hooks/auth/signInErrors");
const useDeleteAccount = require("../src/hooks/useDeleteAccount").default;

const run = async () => {
  const { result } = renderHook(() => useDeleteAccount());
  let outcome;
  await act(async () => {
    outcome = await result.current.deleteAccount();
  });
  return { outcome, result };
};

beforeEach(() => {
  jest.clearAllMocks();
  order.length = 0;
  mockUser.providerData = [{ providerId: "google.com" }];
  auth.currentUser = mockUser;
});

describe("useDeleteAccount", () => {
  // Re-confirming first means the data is never wiped for an account that
  // then cannot be deleted for want of a recent sign-in.
  it("re-confirms identity, deletes the data, disconnects Google, then the account", async () => {
    const { outcome } = await run();
    expect(order).toEqual(["reauth", "data", "googleRevoke", "deleteUser"]);
    expect(outcome.success).toBe(true);
  });

  // Revoking needs her Firebase ID token, so it must come before deleteUser.
  it("revokes Sign in with Apple before deleting an Apple account", async () => {
    mockUser.providerData = [{ providerId: "apple.com" }];
    await run();
    expect(order).toEqual(["reauth", "data", "appleRevoke", "deleteUser"]);
    expect(mockRevokeApple).toHaveBeenCalledWith(mockUser, "apple-code", "key");
  });

  it("does nothing at all when she closes the confirmation sheet", async () => {
    mockRequestGoogle.mockRejectedValueOnce(new SignInCancelledError());
    const { outcome } = await run();
    expect(outcome).toEqual({ success: false, cancelled: true });
    expect(mockDeleteOwnData).not.toHaveBeenCalled();
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it("tells her when she confirmed with a different account", async () => {
    mockReauth.mockRejectedValueOnce(
      Object.assign(new Error("mismatch"), { code: "auth/user-mismatch" }),
    );
    const { outcome } = await run();
    expect(outcome.success).toBe(false);
    expect(outcome.error).toMatch(/isti račun/);
    expect(mockDeleteOwnData).not.toHaveBeenCalled();
  });

  it("still deletes the account when the provider grant cannot be withdrawn", async () => {
    mockRevokeAccess.mockRejectedValueOnce(new Error("offline"));
    const { outcome } = await run();
    expect(outcome.success).toBe(true);
    expect(mockDeleteUser).toHaveBeenCalled();
  });

  // Data gone, sign-in account not: signing out leaves a clean slate she
  // can finish from, instead of a half-deleted session.
  it("signs her out and says so when only the data could be deleted", async () => {
    mockDeleteUser.mockRejectedValueOnce(new Error("network"));
    const { outcome } = await run();
    expect(outcome).toMatchObject({ success: false, partial: true });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("refuses without a signed-in user", async () => {
    auth.currentUser = null;
    const { outcome } = await run();
    expect(outcome.success).toBe(false);
    expect(mockReauth).not.toHaveBeenCalled();
  });
});
