import { useCallback, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteUser,
  reauthenticateWithCredential,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../backend/config/firebase";
import {
  deleteClientDataAsTrainer,
  deleteOwnData,
} from "../../backend/services/accountDeletion";
import { getGoogleSignin, requestGoogleCredential } from "./auth/googleSignin";
import {
  requestAppleCredential,
  revokeAppleAuthorization,
} from "./auth/appleCredential";
import { SignInCancelledError } from "./auth/signInErrors";

/** The Firestore side of accountDeletion's `ops`, for one client. */
export function clientDataOps(userId) {
  const mine = (name) =>
    getDocs(query(collection(db, name), where("userId", "==", userId)));
  return {
    listOwned: async (name) => (await mine(name)).docs.map((d) => d.id),
    listAppointments: async () =>
      (await mine("appointments")).docs.map((d) => ({ id: d.id, ...d.data() })),
    cancelAppointment: (id) =>
      updateDoc(doc(db, "appointments", id), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
      }),
    remove: (name, id) => deleteDoc(doc(db, name, id)),
    removeProfile: () => deleteDoc(doc(db, "users", userId)),
  };
}

const MESSAGES = {
  "auth/user-mismatch":
    "Potvrdila si drugim računom. Odaberi isti račun kojim si prijavljena.",
  "auth/network-request-failed":
    "Nema veze. Provjeri internet i pokušaj ponovo.",
  "google-unavailable":
    "Potvrda Google računom ovdje nije dostupna. Obriši račun iz aplikacije instalirane iz trgovine.",
};

/**
 * A client deleting her own account, in the app (App Store guideline
 * 5.1.1(v); Google Play asks for the same).
 *
 *  1. She confirms her identity again with the provider she signed in with.
 *     Firebase refuses to delete an account without a recent sign-in, and
 *     doing it first means the data is never wiped for an account that then
 *     cannot be deleted.
 *  2. Her data goes (backend/services/accountDeletion.js).
 *  3. Her provider grant is withdrawn: Apple's token is revoked (required),
 *     Google's access disconnected.
 *  4. The sign-in account itself is deleted, which also signs her out.
 */
export default function useDeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return { success: false };
    const providers = (user.providerData ?? []).map((p) => p.providerId);
    const isApple = providers.includes("apple.com");
    const isGoogle = providers.includes("google.com");

    setIsDeleting(true);
    let dataDeleted = false;
    try {
      let appleCode = null;
      if (isApple) {
        const { credential, authorizationCode } =
          await requestAppleCredential();
        appleCode = authorizationCode;
        await reauthenticateWithCredential(user, credential);
      } else if (isGoogle) {
        await reauthenticateWithCredential(
          user,
          await requestGoogleCredential(),
        );
      }

      const result = await deleteOwnData({ ops: clientDataOps(user.uid) });
      dataDeleted = true;

      if (appleCode) {
        try {
          await revokeAppleAuthorization(
            user,
            appleCode,
            auth.app?.options?.apiKey,
          );
        } catch (err) {
          console.warn("Could not revoke the Apple authorization:", err);
        }
      }
      if (isGoogle) {
        try {
          await getGoogleSignin()?.GoogleSignin.revokeAccess();
        } catch (err) {
          console.warn("Could not disconnect Google access:", err);
        }
      }

      await deleteUser(user);
      try {
        await getGoogleSignin()?.GoogleSignin.signOut();
      } catch {
        // Already disconnected above; nothing left to sign out of.
      }
      return { success: true, ...result };
    } catch (err) {
      if (err instanceof SignInCancelledError) {
        return { success: false, cancelled: true };
      }
      console.error("Account deletion failed:", err);
      if (dataDeleted) {
        // Her data is gone but the sign-in account is not. Signing out gives
        // a clean slate: signing in again starts a fresh, empty profile,
        // from which she can finish the deletion.
        await signOut(auth).catch(() => {});
        return {
          success: false,
          partial: true,
          error:
            "Tvoji podaci su obrisani, ali račun za prijavu nije. Prijavi se ponovo i obriši račun još jednom.",
        };
      }
      return {
        success: false,
        error:
          MESSAGES[err?.code] ??
          "Brisanje nije dovršeno. Provjeri vezu i pokušaj ponovo.",
      };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteAccount, isDeleting };
}

/**
 * The trainer erasing a former client's data (e.g. on an e-mail request).
 * Her sign-in account remains until it is deleted in the Firebase console;
 * if she signs in again she starts over in the waiting room, with nothing.
 */
export function useDeleteClientData() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteClientData = useCallback(async (userId) => {
    if (!userId) return { success: false };
    setIsDeleting(true);
    try {
      const result = await deleteClientDataAsTrainer({
        ops: clientDataOps(userId),
      });
      return { success: true, ...result };
    } catch (err) {
      console.error("Deleting client data failed:", err);
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteClientData, isDeleting };
}
