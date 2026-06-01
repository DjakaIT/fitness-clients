import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import { toLocalDateString } from "../../backend/utils/appointmentConfig";
export default function useAppointments(userId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const todayStr = toLocalDateString();

    const q = query(
      collection(db, "appointments"),
      where("userId", "==", userId),
      where("status", "==", "active"),
      where("appointmentDate", ">=", todayStr),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) =>
        a.appointmentDate !== b.appointmentDate
          ? a.appointmentDate.localeCompare(b.appointmentDate)
          : a.time.localeCompare(b.time),
      );
      setAppointments(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { appointments, loading };
}
