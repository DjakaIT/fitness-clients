import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import { toLocalDateString } from "../../backend/utils/appointmentConfig";

/** A user's upcoming active appointments, soonest first. */
export default function useAppointments(userId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "appointments"),
      where("userId", "==", userId),
      where("status", "==", "active"),
      where("appointmentDate", ">=", toLocalDateString()),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) =>
          a.appointmentDate !== b.appointmentDate
            ? a.appointmentDate.localeCompare(b.appointmentDate)
            : a.time.localeCompare(b.time),
        );
        setAppointments(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading appointments:", err);
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  return { appointments, loading, error };
}
