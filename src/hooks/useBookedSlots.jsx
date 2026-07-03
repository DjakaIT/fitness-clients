import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useBookedSlots(weekStart, weekEnd) {
  const [bookedSlots, setBookedSlots] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!weekStart || !weekEnd) {
      setLoading(false);
      return;
    }

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
          const { appointmentDate, time, userId } = d.data();
          if (!slots[appointmentDate]) slots[appointmentDate] = [];
          slots[appointmentDate].push({ id: d.id, time, userId });
        });
        setBookedSlots(slots);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading booked slots:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [weekStart, weekEnd]);

  return { bookedSlots, loading };
}
