import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import { saveTrainingLogsInTransaction } from "../../backend/services/exerciseLogService";
import { toLocalDateString } from "../../backend/utils/appointmentConfig";

/**
 * A client's logged weights, live, as a Map of exerciseId → log. Read by the
 * client (to prefill) and by the trainer (to see progress).
 */
export default function useExerciseLogs(userId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const q = query(
      collection(db, "exercise_logs"),
      where("userId", "==", userId),
    );
    return onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error loading exercise logs:", err);
        setError(err);
        setLoading(false);
      },
    );
  }, [userId]);

  const byExercise = useMemo(
    () => new Map(logs.map((l) => [String(l.exerciseId), l])),
    [logs],
  );

  return { logs, byExercise, loading, error };
}

export function useSaveTrainingLogs() {
  const [isSaving, setIsSaving] = useState(false);

  const saveTraining = useCallback(
    async ({ userId, weekStart, trainingNumber, entries }) => {
      if (!userId) return { success: false };
      setIsSaving(true);
      try {
        const result = await runTransaction(db, (tx) =>
          saveTrainingLogsInTransaction({
            tx,
            logRef: (id) => doc(db, "exercise_logs", id),
            userId,
            weekStart,
            trainingNumber,
            date: toLocalDateString(),
            entries,
            timestamp: serverTimestamp,
          }),
        );
        return { success: true, ...result };
      } catch (error) {
        console.error("Error saving training logs:", error);
        return { success: false };
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return { saveTraining, isSaving };
}
