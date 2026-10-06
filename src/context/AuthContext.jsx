import { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../backend/config/firebase";
import { isAdminEmail } from "../../backend/config/tenant";
import { getGoogleSignin } from "../hooks/auth/googleSignin";
import { resetVideoStore } from "../hooks/useVideos";
import { takePendingDisplayName } from "../hooks/auth/pendingProfile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState(null); // "pending" | "active" | "rejected"
  const [trainingType, setTrainingType] = useState(null); // "online" | "in_person" | null
  const [error, setError] = useState(null);
  const unsubscribeSnapshotRef = useRef(null);
  // Bumped on every auth change. The profile setup below awaits the network;
  // if the user signs out (or switches account) meanwhile, the older run must
  // not go on to attach a listener for the account that is gone.
  const authGenerationRef = useRef(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      const generation = ++authGenerationRef.current;
      const isStale = () => generation !== authGenerationRef.current;

      // Tear down any previous doc listener
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }

      if (!firebaseUser) {
        // The catalogue listener outlives screens on purpose; it must not
        // outlive the session that was allowed to read it.
        resetVideoStore();
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setStatus(null);
        setTrainingType(null);
        setError(null);
        setLoading(false);
        return;
      }

      setError(null);
      const userRef = doc(db, "users", firebaseUser.uid);

      // Sign in with Apple leaves displayName null: Apple sends the name only
      // on the first authorization, and as part of the sign-in result rather
      // than the credential. useAppleAuth stashes it before signing in; take
      // it on every sign-in (so it can never leak into a later one) and use
      // it only when the account has no name of its own.
      const pendingName = takePendingDisplayName();
      let displayName = firebaseUser.displayName;
      if (!displayName && pendingName) {
        displayName = pendingName;
        // Store it on the Auth account too, so the next session — on this
        // device or another — has it without Apple ever sending it again.
        updateProfile(firebaseUser, { displayName: pendingName }).catch((err) =>
          console.warn("Could not save Apple name to profile:", err),
        );
      }

      try {
        const userSnap = await getDoc(userRef);
        if (isStale()) return;
        if (!userSnap.exists()) {
          // First sign-in. The trainer's own account bootstraps as an approved
          // admin; everyone else starts pending. Firestore rules enforce this
          // same split, so a tampered client cannot self-approve.
          const isTrainerAccount = isAdminEmail(firebaseUser.email);
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: displayName ?? null,
            photoURL: firebaseUser.photoURL ?? null,
            role: isTrainerAccount ? "admin" : "user",
            status: isTrainerAccount ? "active" : "pending",
            trainingType: null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });
        } else {
          // Never re-write role or status here: they are the trainer's to set,
          // and the rules reject a client that tries. Name and photo are only
          // written when present — an Apple account has neither on every
          // sign-in after the first, and writing null would erase the name
          // captured that first time.
          const refresh = { lastLogin: serverTimestamp() };
          if (displayName) refresh.displayName = displayName;
          if (firebaseUser.photoURL) refresh.photoURL = firebaseUser.photoURL;
          await setDoc(userRef, refresh, { merge: true });
        }
      } catch (err) {
        if (isStale()) return;
        console.error("Error setting up user doc:", err);
        setError("profile-setup-failed");
        setLoading(false);
        return;
      }

      if (isStale()) return;

      // Real-time listener — fires immediately with current data, then on every change
      unsubscribeSnapshotRef.current = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            // Fail closed: a document without a status has not been approved
            // as far as firestore.rules is concerned (they test for "active"
            // exactly), so treating it as active here would only open a
            // broken app full of permission errors.
            setStatus(data.status ?? "pending");
            setTrainingType(data.trainingType ?? null);
            // Authority for "is this the trainer" is the stored role, which only
            // the trainer can write. The e-mail is used for bootstrap only.
            setIsAdmin(data.role === "admin");
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: data.displayName ?? firebaseUser.displayName,
              photoURL: data.photoURL ?? firebaseUser.photoURL,
            });
            setIsAuthenticated(true);
          }
          setLoading(false);
        },
        (err) => {
          // Without this the spinner would hang forever on a permission error.
          console.error("Error listening to user doc:", err);
          setError("profile-unavailable");
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshotRef.current) unsubscribeSnapshotRef.current();
    };
  }, []);

  const logout = async () => {
    // Firebase sign-out is the one that actually matters, so it must run even
    // if the Google SDK throws (e.g. Play Services missing).
    try {
      await getGoogleSignin()?.GoogleSignin.signOut();
    } catch (err) {
      console.warn("Google sign-out failed, continuing:", err);
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
      return { success: false };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        logout,
        loading,
        isAdmin,
        status,
        trainingType,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
