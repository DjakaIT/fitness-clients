import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { signInWithCredential } from "firebase/auth";
import { auth } from "../../../backend/config/firebase";
import {
  appleSignInErrorMessage,
  formatAppleFullName,
} from "../../../backend/utils/appleAuth";
import {
  clearPendingDisplayName,
  setPendingDisplayName,
} from "./pendingProfile";
import { requestAppleCredential } from "./appleCredential";
import { SignInCancelledError } from "./signInErrors";

/**
 * Sign in with Apple → Firebase Auth. iOS only; `available` stays false
 * everywhere else, so callers can simply not render the button.
 */
export function useAppleAuth() {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (Platform.OS !== "ios") return undefined;
    let active = true;
    AppleAuthentication.isAvailableAsync()
      .then((ok) => {
        if (active) setAvailable(Boolean(ok));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { credential, fullName } = await requestAppleCredential();

      // Before signing in: AuthContext picks it up from onAuthStateChanged.
      setPendingDisplayName(formatAppleFullName(fullName));

      await signInWithCredential(auth, credential);
      return { success: true };
    } catch (err) {
      clearPendingDisplayName();
      if (err instanceof SignInCancelledError) {
        return { success: false, cancelled: true };
      }
      console.error("Apple Sign-In error:", err);
      const message = appleSignInErrorMessage(err?.code);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { available, signIn, loading, error, clearError };
}
