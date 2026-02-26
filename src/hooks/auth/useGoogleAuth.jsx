import { useState } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../../backend/config/firebase";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      const idToken = response?.data?.idToken;

      if (!idToken) {
        throw new Error("No idToken received from Google Sign-In");
      }

      const credential = GoogleAuthProvider.credential(idToken);

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
