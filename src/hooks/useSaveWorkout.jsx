import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useSaveWorkout() {
  const [isSaving, setIsSaving] = useState(false);

  const saveWorkout = async ({
    userId,
    weekStart,
    trainingNumber,
    sessionsPerWeek,
    exercises,
  }) => {
    setIsSaving(true);
    const docId = `${weekStart}_${userId}_${trainingNumber}`;
    try {
      await setDoc(
        doc(db, "workouts", docId),
        {
          userId,
          weekStart,
          trainingNumber,
          sessionsPerWeek,
          exercises,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      return { success: true };
    } catch (error) {
      console.error("Error saving workout:", error);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveWorkout, isSaving };
}
