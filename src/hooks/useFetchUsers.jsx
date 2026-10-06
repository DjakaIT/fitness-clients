import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

/**
 * The trainer's approved clients, live, optionally of one training type.
 *
 * Approved only: a pending client already has her own "requests" section and
 * a rejected one is not a client. Live, so a client approved a moment ago
 * appears without leaving the screen.
 */
export default function useFetchUsers(trainingType = null) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const constraints = [
      where("role", "==", "user"),
      where("status", "==", "active"),
    ];
    if (trainingType) {
      constraints.push(where("trainingType", "==", trainingType));
    }
    return onSnapshot(
      query(collection(db, "users"), ...constraints),
      (snapshot) => {
        setUsers(snapshot.docs.map((u) => ({ id: u.id, ...u.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError(err);
        setLoading(false);
      },
    );
  }, [trainingType]);

  return { users, loading, error };
}
