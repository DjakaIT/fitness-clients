import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../backend/config/firebase";

/**
 * Deletes an entire week's program (all training docs) for a client.
 */
export default function useDeleteWorkout() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteWeek = async (userId, weekStart) => {
    if (!userId || !weekStart) return { success: false };

    setIsDeleting(true);
    try {
      const q = query(
        collection(db, "workouts"),
        where("userId", "==", userId),
        where("weekStart", "==", weekStart),
      );
      const snap = await getDocs(q);
      await Promise.all(
        snap.docs.map((d) => deleteDoc(doc(db, "workouts", d.id))),
      );
      return { success: true };
    } catch (error) {
      console.error("Error deleting workouts:", error);
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteWeek, isDeleting };
}
