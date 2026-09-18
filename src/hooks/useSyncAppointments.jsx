import { useCallback, useState } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import {
  SlotTakenError,
  syncWeekInTransaction,
} from "../../backend/services/appointmentService";
import { formatDateShort } from "../../backend/utils/appointmentConfig";

/**
 * Commits a client's whole week in one atomic transaction: slots they dropped
 * are released and slots they added are claimed, or nothing happens at all.
 */
export default function useSyncAppointments() {
  const [isSaving, setIsSaving] = useState(false);

  const syncWeek = useCallback(async (userId, desired, existing) => {
    if (!userId) return { success: false, error: "Nedostaje korisnik." };

    setIsSaving(true);
    try {
      const result = await runTransaction(db, (tx) =>
        syncWeekInTransaction({
          tx,
          slotRef: (id) => doc(db, "appointments", id),
          userId,
          desired,
          existing,
          timestamp: serverTimestamp,
        }),
      );
      return { success: true, ...result };
    } catch (error) {
      if (error instanceof SlotTakenError) {
        return {
          success: false,
          code: error.code,
          error: `Termin ${formatDateShort(error.slot.date)} u ${error.slot.time} je upravo netko rezervirao. Odaberi drugi.`,
        };
      }
      console.error("Error syncing appointments:", error);
      return {
        success: false,
        code: error?.code ?? "unknown",
        error: "Termini nisu spremljeni. Provjeri vezu i pokušaj ponovo.",
      };
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { syncWeek, isSaving };
}
