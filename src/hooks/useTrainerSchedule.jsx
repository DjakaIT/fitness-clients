import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useTrainerSchedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "config", "trainerSchedule"),
      (snap) => {
        setSchedule(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading trainer schedule:", error);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  return { schedule, loading };
}
