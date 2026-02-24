import { useState } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../../backend/config/firebase";

// Your WEB client ID (the one from the OAuth 2.0 "Web application" entry
// in Google Cloud Console — NOT the Android or iOS client ID).
GoogleSignin.configure({
  webClientId:
    "547929281594-hk36g23e4rnbr9i2cbp2brmuf2ftrdqv.apps.googleusercontent.com",
});

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    try {
      setLoading(true);

      // Make sure Play Services are available (Android only, no-op on iOS)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Show the native Google sign-in dialog
      const response = await GoogleSignin.signIn();

      // Extract the idToken from the response
      const idToken = response?.data?.idToken;

      if (!idToken) {
        throw new Error("No idToken received from Google Sign-In");
      }

      // Create a Firebase credential with the token
      const credential = GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase
      await signInWithCredential(auth, credential);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the sign-in");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign-in already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error("Google Play Services not available");
      } else {
        console.error("Google Sign-In Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading };
}
