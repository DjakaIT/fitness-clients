import { GoogleAuthProvider } from "firebase/auth";
import { SignInCancelledError } from "./signInErrors";

export { SignInCancelledError };

/**
 * The Google Sign-In native module, configured — or null where it does not
 * exist. Expo Go (the free App Store app used to try this project on an
 * iPhone before a paid Apple developer account) has no such module: its
 * library throws the moment it is imported, so it is loaded here, once, on
 * demand, and its absence is a normal answer rather than a crash.
 */
let cached;

export function getGoogleSignin() {
  if (cached !== undefined) return cached;
  try {
    const mod = require("@react-native-google-signin/google-signin");
    mod.GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      // Only the iOS native flow reads this (Android uses webClientId alone).
      // Passing it avoids a bundled GoogleService-Info.plist — see the
      // "without Firebase" mode of the library's config plugin, which
      // app.json uses via `iosUrlScheme`.
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
    cached = mod;
  } catch (err) {
    console.warn("Google Sign-In is not available in this build:", err);
    cached = null;
  }
  return cached;
}

/**
 * Shows Google's account picker and returns a Firebase credential for the
 * chosen account. Used both to sign in and to re-confirm the account before
 * it is deleted.
 *
 * Backing out throws SignInCancelledError. The library reports that two
 * ways — v16 returns `{ type: "cancelled" }`, older versions threw
 * SIGN_IN_CANCELLED — and treating the first as a missing token used to show
 * "sign-in failed" to someone who had simply closed the picker.
 */
export async function requestGoogleCredential() {
  const mod = getGoogleSignin();
  if (!mod) {
    throw Object.assign(new Error("Google Sign-In is unavailable."), {
      code: "google-unavailable",
    });
  }
  const { GoogleSignin, statusCodes } = mod;
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (response?.type === "cancelled") throw new SignInCancelledError();
    const idToken = response?.data?.idToken;
    if (!idToken) throw new Error("No idToken received from Google Sign-In");
    return GoogleAuthProvider.credential(idToken);
  } catch (err) {
    if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new SignInCancelledError();
    }
    throw err;
  }
}
