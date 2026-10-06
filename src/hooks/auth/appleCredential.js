import * as AppleAuthentication from "expo-apple-authentication";
import { OAuthProvider } from "firebase/auth";
import { isAppleCancellation } from "../../../backend/utils/appleAuth";
import { SignInCancelledError } from "./signInErrors";

/**
 * Shows Apple's sheet and returns a Firebase credential, plus what Apple
 * hands over only here: the name (first authorization only) and a one-time
 * authorization code (what account deletion uses to revoke the app's access).
 * Used both to sign in and to re-confirm the account before it is deleted.
 *
 * Firebase requires a nonce: Apple is given its SHA-256, Firebase the raw
 * value, and Firebase checks they match — which is what stops a stolen Apple
 * identity token from being replayed.
 */
export async function requestAppleCredential() {
  // Required here rather than at module scope: expo-crypto throws on import
  // when its native module is missing, and this path only ever runs on iOS —
  // Android must never evaluate it.
  const Crypto = require("expo-crypto");
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  let result;
  try {
    result = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (err) {
    if (isAppleCancellation(err)) throw new SignInCancelledError();
    throw err;
  }
  if (!result.identityToken) {
    throw new Error("No identityToken received from Apple");
  }

  return {
    credential: new OAuthProvider("apple.com").credential({
      idToken: result.identityToken,
      rawNonce,
    }),
    fullName: result.fullName ?? null,
    authorizationCode: result.authorizationCode ?? null,
  };
}

/**
 * Revokes the app's Sign in with Apple authorization — required by App Store
 * guideline 5.1.1(v) when an account is deleted.
 *
 * The JS SDK's revokeAccessToken() only takes an OAuth *access* token, which
 * the native flow never yields; the native flow yields an authorization code,
 * so this sends that to the same Identity Toolkit endpoint the iOS Firebase
 * SDK uses for it (token type 3 = authorization code). Firebase exchanges and
 * revokes it with Apple — which only works once the Apple provider in the
 * Firebase console has its Services ID, Team ID, Key ID and private key.
 *
 * Must run while the account still exists: it needs her Firebase ID token.
 */
export async function revokeAppleAuthorization(
  firebaseUser,
  authorizationCode,
  apiKey,
) {
  if (!firebaseUser || !authorizationCode || !apiKey) return false;
  const idToken = await firebaseUser.getIdToken();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v2/accounts:revokeToken?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: "apple.com",
        // Serialised exactly as the iOS SDK sends it.
        tokenType: "3",
        token: authorizationCode,
        idToken,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Apple token revocation failed (${response.status})`);
  }
  return true;
}
