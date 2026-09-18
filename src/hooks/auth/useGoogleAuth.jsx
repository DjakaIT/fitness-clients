import { useCallback, useState } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../../backend/config/firebase";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

/** Failures the user can act on, separated from the ones they cannot. */
const MESSAGES = {
  [statusCodes.PLAY_SERVICES_NOT_AVAILABLE]:
    "Google Play usluge nisu dostupne ili su zastarjele.",
  [statusCodes.IN_PROGRESS]: "Prijava je već u tijeku.",
};

const GENERIC_MESSAGE = "Prijava nije uspjela. Provjeri vezu i pokušaj ponovo.";

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();
      const idToken = response?.data?.idToken;
      if (!idToken) throw new Error("No idToken received from Google Sign-In");

      await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
      return { success: true };
    } catch (err) {
      // Cancelling is a choice, not a failure — it must not raise an error.
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, cancelled: true };
      }

      // Previously every failure was only logged, so a user whose sign-in
      // broke saw the button simply stop spinning with no explanation.
      console.error("Google Sign-In error:", err);
      const message = MESSAGES[err.code] ?? GENERIC_MESSAGE;
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { signIn, loading, error, clearError };
}
