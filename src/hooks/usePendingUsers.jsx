import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

/**
 * Whether a client is still waiting for the trainer's decision. The app shows
 * every status other than "active" and "rejected" the waiting room — including
 * a missing one and legacy values like "inactive" — so every such client must
 * reach the trainer's requests list too. A `status == "pending"` query would
 * leave the others waiting for an approval nobody can see.
 */
export function isAwaitingApproval(user) {
  return user?.status !== "active" && user?.status !== "rejected";
}

export default function usePendingUsers() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "user"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPendingUsers(
          snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter(isAwaitingApproval),
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error loading pending users:", error);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  return { pendingUsers, loading };
}
