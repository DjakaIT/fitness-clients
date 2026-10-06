import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import {
  hoursUntilAppointment,
  toLocalDateString,
} from "../../backend/utils/appointmentConfig";
import { BOOKING_POLICY } from "../../backend/config/tenant";

/**
 * Still worth listing: not yet over. The query can only cut at today's date,
 * so this morning's finished session would otherwise sit at the top of
 * "upcoming" all day, offering a cancel button that can only fail.
 */
export function isNotOver(appointment, now = Date.now()) {
  const hours = hoursUntilAppointment(
    appointment.appointmentDate,
    appointment.time,
    now,
  );
  return !Number.isNaN(hours) && hours * 60 > -BOOKING_POLICY.sessionMinutes;
}

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
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((a) => isNotOver(a));
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
