import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";
import {
  appleSignInErrorMessage,
  formatAppleFullName,
  isAppleCancellation,
  isPrivateRelayEmail,
} from "../backend/utils/appleAuth";
import {
  clearPendingDisplayName,
  setPendingDisplayName,
  takePendingDisplayName,
} from "../src/hooks/auth/pendingProfile";

const mockSignInAsync = jest.fn();
const mockIsAvailable = jest.fn();
const mockSignInWithCredential = jest.fn();
const mockOAuthCredential = jest.fn(() => ({ provider: "apple.com" }));
const mockDigest = jest.fn();
const mockRandomUUID = jest.fn();

jest.mock("expo-apple-authentication", () => ({
  isAvailableAsync: (...a) => mockIsAvailable(...a),
  signInAsync: (...a) => mockSignInAsync(...a),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

jest.mock("expo-crypto", () => ({
  randomUUID: (...a) => mockRandomUUID(...a),
  digestStringAsync: (...a) => mockDigest(...a),
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
}));

jest.mock("firebase/auth", () => ({
  signInWithCredential: (...a) => mockSignInWithCredential(...a),
  OAuthProvider: jest.fn().mockImplementation((providerId) => ({
    providerId,
    credential: (...a) => mockOAuthCredential(...a),
  })),
}));

const { useAppleAuth } = require("../src/hooks/auth/useAppleAuth");

const codeError = (code) => Object.assign(new Error(code), { code });

describe("formatAppleFullName", () => {
  it("joins given and family name", () => {
    expect(formatAppleFullName({ givenName: "Ana", familyName: "Anić" })).toBe(
      "Ana Anić",
    );
  });

  it("works with only one part", () => {
    expect(formatAppleFullName({ givenName: "Ana", familyName: null })).toBe(
      "Ana",
    );
  });

  // Apple sends an object with every field null on every sign-in after the
  // first — that must read as "no name", not as an empty string.
  it.each([
    null,
    undefined,
    {},
    { givenName: null, familyName: null },
    { givenName: "  ", familyName: "" },
  ])("returns null for %p", (input) => {
    expect(formatAppleFullName(input)).toBeNull();
  });

  it("trims whitespace and caps the length", () => {
    expect(
      formatAppleFullName({ givenName: "  Ana ", familyName: " A " }),
    ).toBe("Ana A");
    expect(
      formatAppleFullName({ givenName: "x".repeat(200) }).length,
    ).toBeLessThanOrEqual(80);
  });
});

describe("error handling helpers", () => {
  it("recognises a private relay address", () => {
    expect(isPrivateRelayEmail("abc@privaterelay.appleid.com")).toBe(true);
    expect(isPrivateRelayEmail("ABC@PrivateRelay.AppleID.com")).toBe(true);
    expect(isPrivateRelayEmail("ana@gmail.com")).toBe(false);
    expect(isPrivateRelayEmail(null)).toBe(false);
  });

  it("treats closing Apple's sheet as a cancellation", () => {
    expect(isAppleCancellation(codeError("ERR_REQUEST_CANCELED"))).toBe(true);
    expect(isAppleCancellation(codeError("auth/other"))).toBe(false);
    expect(isAppleCancellation(undefined)).toBe(false);
  });

  // The same person, same e-mail, already signed up with Google: Firebase is
  // on one-account-per-email, so tell her the way in rather than "failed".
  it("points an existing Google user back to Google", () => {
    expect(
      appleSignInErrorMessage("auth/account-exists-with-different-credential"),
    ).toMatch(/Google/);
  });

  it("falls back to a generic message", () => {
    expect(appleSignInErrorMessage("something/else")).toMatch(/Pokušaj/);
    expect(appleSignInErrorMessage(undefined)).toMatch(/Pokušaj/);
  });
});

describe("pendingProfile", () => {
  afterEach(() => clearPendingDisplayName());

  it("hands a name over exactly once", () => {
    setPendingDisplayName("Ana");
    expect(takePendingDisplayName()).toBe("Ana");
    expect(takePendingDisplayName()).toBeNull();
  });

  it("ignores blank and non-string names", () => {
    setPendingDisplayName("   ");
    expect(takePendingDisplayName()).toBeNull();
    setPendingDisplayName(null);
    expect(takePendingDisplayName()).toBeNull();
  });
});

describe("useAppleAuth", () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    clearPendingDisplayName();
    Platform.OS = "ios";
    mockIsAvailable.mockResolvedValue(true);
    mockRandomUUID.mockReturnValue("raw-nonce");
    mockDigest.mockResolvedValue("hashed-nonce");
    mockSignInAsync.mockResolvedValue({
      identityToken: "apple-id-token",
      fullName: { givenName: "Ana", familyName: "Anić" },
    });
    mockSignInWithCredential.mockResolvedValue({});
  });

  afterAll(() => {
    Platform.OS = originalOS;
  });

  it("is available on an iOS device that supports it", async () => {
    const { result } = renderHook(() => useAppleAuth());
    await waitFor(() => expect(result.current.available).toBe(true));
  });

  it("never offers Apple on Android", async () => {
    Platform.OS = "android";
    const { result } = renderHook(() => useAppleAuth());
    await act(async () => {});
    expect(result.current.available).toBe(false);
    expect(mockIsAvailable).not.toHaveBeenCalled();
  });

  // The nonce is what makes a stolen Apple token useless: Apple gets the
  // hash, Firebase the raw value, and Firebase checks they match.
  it("gives Apple the hashed nonce and Firebase the raw one", async () => {
    const { result } = renderHook(() => useAppleAuth());
    await act(async () => {
      await result.current.signIn();
    });

    expect(mockDigest).toHaveBeenCalledWith("SHA-256", "raw-nonce");
    expect(mockSignInAsync.mock.calls[0][0]).toMatchObject({
      nonce: "hashed-nonce",
    });
    expect(mockOAuthCredential).toHaveBeenCalledWith({
      idToken: "apple-id-token",
      rawNonce: "raw-nonce",
    });
    expect(mockSignInWithCredential).toHaveBeenCalledTimes(1);
  });

  it("stashes Apple's one-time name before signing in", async () => {
    let stashedAtSignIn;
    mockSignInWithCredential.mockImplementation(async () => {
      stashedAtSignIn = takePendingDisplayName();
    });
    const { result } = renderHook(() => useAppleAuth());
    await act(async () => {
      await result.current.signIn();
    });
    expect(stashedAtSignIn).toBe("Ana Anić");
  });

  it("treats closing the sheet as a quiet cancel", async () => {
    mockSignInAsync.mockRejectedValue(codeError("ERR_REQUEST_CANCELED"));
    const { result } = renderHook(() => useAppleAuth());

    let outcome;
    await act(async () => {
      outcome = await result.current.signIn();
    });

    expect(outcome).toEqual({ success: false, cancelled: true });
    expect(result.current.error).toBeNull();
    expect(mockSignInWithCredential).not.toHaveBeenCalled();
  });

  it("tells an existing Google user to use Google", async () => {
    mockSignInWithCredential.mockRejectedValue(
      codeError("auth/account-exists-with-different-credential"),
    );
    const { result } = renderHook(() => useAppleAuth());
    await act(async () => {
      await result.current.signIn();
    });
    expect(result.current.error).toMatch(/Google/);
  });

  // A failed attempt must not leave a name behind for the next sign-in.
  it("clears the stashed name when sign-in fails", async () => {
    mockSignInWithCredential.mockRejectedValue(
      codeError("auth/network-request-failed"),
    );
    const { result } = renderHook(() => useAppleAuth());
    await act(async () => {
      await result.current.signIn();
    });
    expect(takePendingDisplayName()).toBeNull();
  });

  it("refuses to continue without an identity token", async () => {
    mockSignInAsync.mockResolvedValue({ identityToken: null });
    const { result } = renderHook(() => useAppleAuth());
    let outcome;
    await act(async () => {
      outcome = await result.current.signIn();
    });
    expect(outcome.success).toBe(false);
    expect(mockSignInWithCredential).not.toHaveBeenCalled();
  });

  it("always clears the busy flag", async () => {
    mockSignInAsync.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAppleAuth());
    await act(async () => {
      await result.current.signIn();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
