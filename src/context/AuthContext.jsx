import { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../backend/config/firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const AuthContext = createContext(null);
const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState(null); // "pending" | "active" | "rejected"
  const [trainingType, setTrainingType] = useState(null); // "online" | "in_person" | null
  const unsubscribeSnapshotRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Tear down any previous doc listener
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }

      if (firebaseUser) {
        const isAdminUser = firebaseUser.email === ADMIN_EMAIL;
        const roleBadge = isAdminUser ? "admin" : "user";
        const userRef = doc(db, "users", firebaseUser.uid);

        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            // Brand-new user
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: roleBadge,
              status: isAdminUser ? "active" : "pending",
              trainingType: null,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
          } else {
            await setDoc(
              userRef,
              { role: roleBadge, lastLogin: serverTimestamp() },
              { merge: true },
            );
          }
        } catch (error) {
          console.error("Error setting up user doc:", error);
          setLoading(false);
          return;
        }

        // Real-time listener — fires immediately with current data, then on every change
        unsubscribeSnapshotRef.current = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setStatus(data.status ?? "active"); // legacy users (no status field) treated as active
            setTrainingType(data.trainingType ?? null);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
            setIsAuthenticated(true);
            setIsAdmin(isAdminUser);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setStatus(null);
        setTrainingType(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshotRef.current) unsubscribeSnapshotRef.current();
    };
  }, []);

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      setStatus(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
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
