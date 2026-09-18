import { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../backend/config/firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { isAdminEmail } from "../../backend/config/tenant";

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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Tear down any previous doc listener
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }

      if (!firebaseUser) {
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

      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          // First sign-in. The trainer's own account bootstraps as an approved
          // admin; everyone else starts pending. Firestore rules enforce this
          // same split, so a tampered client cannot self-approve.
          const isTrainerAccount = isAdminEmail(firebaseUser.email);
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: isTrainerAccount ? "admin" : "user",
            status: isTrainerAccount ? "active" : "pending",
            trainingType: null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });
        } else {
          // Never re-write role or status here: they are the trainer's to set,
          // and the rules reject a client that tries.
          await setDoc(
            userRef,
            {
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              lastLogin: serverTimestamp(),
            },
            { merge: true },
          );
        }
      } catch (err) {
        console.error("Error setting up user doc:", err);
        setError("profile-setup-failed");
        setLoading(false);
        return;
      }

      // Real-time listener — fires immediately with current data, then on every change
      unsubscribeSnapshotRef.current = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setStatus(data.status ?? "active"); // legacy users (no status field) treated as active
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
      await GoogleSignin.signOut();
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
