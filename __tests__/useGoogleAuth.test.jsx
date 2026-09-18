import { renderHook, act, waitFor } from "@testing-library/react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { signInWithCredential } from "firebase/auth";

const { useGoogleAuth } = require("../src/hooks/auth/useGoogleAuth");

const codeError = (code) => Object.assign(new Error(code), { code });

beforeEach(() => {
  jest.clearAllMocks();
  GoogleSignin.hasPlayServices.mockResolvedValue(true);
  GoogleSignin.signIn.mockResolvedValue({ data: { idToken: "token-123" } });
  signInWithCredential.mockResolvedValue({});
});

describe("useGoogleAuth", () => {
  it("exchanges the Google id token for a Firebase session", async () => {
    const { result } = renderHook(() => useGoogleAuth());

    let outcome;
    await act(async () => {
      outcome = await result.current.signIn();
    });

    expect(signInWithCredential).toHaveBeenCalledTimes(1);
    expect(outcome).toEqual({ success: true });
    expect(result.current.error).toBeNull();
  });

  // A user who backs out has not hit an error; showing one would be wrong.
  it("treats cancellation as a quiet no-op, not a failure", async () => {
    GoogleSignin.signIn.mockRejectedValue(
      codeError(statusCodes.SIGN_IN_CANCELLED),
    );
    const { result } = renderHook(() => useGoogleAuth());

    let outcome;
    await act(async () => {
      outcome = await result.current.signIn();
    });

    expect(outcome).toEqual({ success: false, cancelled: true });
    expect(result.current.error).toBeNull();
  });

  // Regression: every failure used to be swallowed into console.error, so the
  // spinner just stopped and the user was told nothing.
  it("surfaces a message the user can act on when Play Services is missing", async () => {
    GoogleSignin.hasPlayServices.mockRejectedValue(
      codeError(statusCodes.PLAY_SERVICES_NOT_AVAILABLE),
    );
    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signIn();
    });

    await waitFor(() => expect(result.current.error).toMatch(/Google Play/));
  });

  it("falls back to a generic message for an unknown failure", async () => {
    GoogleSignin.signIn.mockRejectedValue(new Error("socket hang up"));
    const { result } = renderHook(() => useGoogleAuth());

    let outcome;
    await act(async () => {
      outcome = await result.current.signIn();
    });

    expect(outcome.success).toBe(false);
    expect(outcome.error).not.toContain("socket hang up");
    expect(result.current.error).toBe(outcome.error);
  });

  it("fails rather than proceeding when Google returns no id token", async () => {
    GoogleSignin.signIn.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useGoogleAuth());

    let outcome;
    await act(async () => {
      outcome = await result.current.signIn();
    });

    expect(signInWithCredential).not.toHaveBeenCalled();
    expect(outcome.success).toBe(false);
  });

  it("clears the busy flag on every path", async () => {
    GoogleSignin.signIn.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signIn();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("lets the screen dismiss a stale error", async () => {
    GoogleSignin.signIn.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signIn();
    });
    expect(result.current.error).not.toBeNull();

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });
});
