import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useClientWorkouts(userId, weekStart) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !weekStart) {
      setLoading(false);
      return;
    }

    // Reset immediately so stale data from a previous week never bleeds into the new one
    setWorkouts([]);
    setLoading(true);

    const q = query(
      collection(db, "workouts"),
      where("userId", "==", userId),
      where("weekStart", "==", weekStart),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => a.trainingNumber - b.trainingNumber);
        setWorkouts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading workouts:", error);
        setLoading(false);
      },
    );

    return unsub;
  }, [userId, weekStart]);

  return { workouts, loading };
}
