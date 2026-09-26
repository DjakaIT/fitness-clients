import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../../backend/config/firebase";
import {
  appleSignInErrorMessage,
  formatAppleFullName,
  isAppleCancellation,
} from "../../../backend/utils/appleAuth";
import {
  clearPendingDisplayName,
  setPendingDisplayName,
} from "./pendingProfile";

/**
 * Sign in with Apple → Firebase Auth. iOS only; `available` stays false
 * everywhere else, so callers can simply not render the button.
 *
 * Firebase requires a nonce: Apple is given its SHA-256, Firebase the raw
 * value, and Firebase checks they match — which is what stops a stolen Apple
 * identity token from being replayed.
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
      // Required here rather than at module scope: expo-crypto throws on
      // import when its native module is missing, and this path only ever
      // runs on iOS — Android must never evaluate it.
      const Crypto = require("expo-crypto");
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const result = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!result.identityToken) {
        throw new Error("No identityToken received from Apple");
      }

      // Before signing in: AuthContext picks it up from onAuthStateChanged.
      setPendingDisplayName(formatAppleFullName(result.fullName));

      const credential = new OAuthProvider("apple.com").credential({
        idToken: result.identityToken,
        rawNonce,
      });
      await signInWithCredential(auth, credential);
      return { success: true };
    } catch (err) {
      clearPendingDisplayName();
      if (isAppleCancellation(err)) {
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
