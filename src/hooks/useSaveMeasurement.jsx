import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

/**
 * Upserts one measurement entry (keyed by client + date, so re-saving the same
 * date corrects the existing entry rather than creating a duplicate).
 */
export default function useSaveMeasurement() {
  const [isSaving, setIsSaving] = useState(false);

  const saveMeasurement = async ({
    userId,
    date,
    weight = "",
    waist = "",
    hips = "",
    chest = "",
    arms = "",
  }) => {
    if (!userId || !date) return { success: false };

    setIsSaving(true);
    const docId = `${userId}_${date}`;
    try {
      await setDoc(
        doc(db, "measurements", docId),
        {
          userId,
          date,
          weight: weight.trim(),
          waist: waist.trim(),
          hips: hips.trim(),
          chest: chest.trim(),
          arms: arms.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      return { success: true };
    } catch (error) {
      console.error("Error saving measurement:", error);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveMeasurement, isSaving };
}
