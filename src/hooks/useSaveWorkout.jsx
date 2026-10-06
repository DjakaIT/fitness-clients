import { useState } from "react";
import { doc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

const workoutDocId = (weekStart, userId, trainingNumber) =>
  `${weekStart}_${userId}_${trainingNumber}`;

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
    const docId = workoutDocId(weekStart, userId, trainingNumber);
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

  /**
   * A whole week's program in one atomic write. Saving training by training
   * could fail halfway and leave the client a mix of the old and new program;
   * and trainings beyond a reduced `sessionsPerWeek` (4 → 3) used to stay
   * behind. `trainings` is indexed 0..sessionsPerWeek-1; `existingNumbers`
   * are the training numbers already stored for that week.
   */
  const saveWeek = async ({
    userId,
    weekStart,
    sessionsPerWeek,
    trainings,
    existingNumbers = [],
  }) => {
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      for (let i = 0; i < sessionsPerWeek; i++) {
        batch.set(
          doc(db, "workouts", workoutDocId(weekStart, userId, i + 1)),
          {
            userId,
            weekStart,
            trainingNumber: i + 1,
            sessionsPerWeek,
            exercises: trainings[i] ?? [],
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
      for (const n of existingNumbers) {
        if (n > sessionsPerWeek) {
          batch.delete(doc(db, "workouts", workoutDocId(weekStart, userId, n)));
        }
      }
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error("Error saving week program:", error);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveWorkout, saveWeek, isSaving };
}
