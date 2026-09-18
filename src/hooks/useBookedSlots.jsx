import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

/**
 * Every active booking in [weekStart, weekEnd], grouped by date.
 * Shape: { "2025-03-10": [{ id, time, userId, status }], ... }
 */
export default function useBookedSlots(weekStart, weekEnd) {
  const [bookedSlots, setBookedSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!weekStart || !weekEnd) {
      setBookedSlots({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "appointments"),
      where("appointmentDate", ">=", weekStart),
      where("appointmentDate", "<=", weekEnd),
      where("status", "==", "active"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const slots = {};
        snapshot.docs.forEach((d) => {
          const { appointmentDate, time, userId, status } = d.data();
          if (!slots[appointmentDate]) slots[appointmentDate] = [];
          slots[appointmentDate].push({ id: d.id, time, userId, status });
        });
        setBookedSlots(slots);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading booked slots:", err);
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [weekStart, weekEnd]);

  return { bookedSlots, loading, error };
}
