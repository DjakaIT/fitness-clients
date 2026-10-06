import { useCallback, useState } from "react";
import { signInWithCredential } from "firebase/auth";
import { auth } from "../../../backend/config/firebase";
import {
  SignInCancelledError,
  getGoogleSignin,
  requestGoogleCredential,
} from "./googleSignin";

/** Failures the user can act on, separated from the ones they cannot. */
const MESSAGES = {
  PLAY_SERVICES_NOT_AVAILABLE:
    "Google Play usluge nisu dostupne ili su zastarjele.",
  IN_PROGRESS: "Prijava je već u tijeku.",
};

const GENERIC_MESSAGE = "Prijava nije uspjela. Provjeri vezu i pokušaj ponovo.";

export function useGoogleAuth() {
  // False only where the native module is missing (Expo Go).
  const [available] = useState(() => getGoogleSignin() !== null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const credential = await requestGoogleCredential();
      await signInWithCredential(auth, credential);
      return { success: true };
    } catch (err) {
      // Cancelling is a choice, not a failure — it must not raise an error.
      if (err instanceof SignInCancelledError) {
        return { success: false, cancelled: true };
      }

      // Previously every failure was only logged, so a user whose sign-in
      // broke saw the button simply stop spinning with no explanation.
      console.error("Google Sign-In error:", err);
      const statusCodes = getGoogleSignin()?.statusCodes ?? {};
      const known = Object.keys(MESSAGES).find(
        (key) => statusCodes[key] && statusCodes[key] === err?.code,
      );
      const message = known ? MESSAGES[known] : GENERIC_MESSAGE;
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { available, signIn, loading, error, clearError };
}
