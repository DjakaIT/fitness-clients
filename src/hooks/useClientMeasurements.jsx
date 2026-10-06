import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

/**
 * Realtime list of a client's body measurements, newest first.
 * Each doc: { userId, date: "YYYY-MM-DD", weight, waist, hips, chest, arms }
 */
export default function useClientMeasurements(userId) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setMeasurements([]);
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "measurements"),
      where("userId", "==", userId),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by date descending (newest first).
        data.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
        setMeasurements(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading measurements:", err);
        setError(err);
        setLoading(false);
      },
    );

    return unsub;
  }, [userId]);

  return { measurements, loading, error };
}
