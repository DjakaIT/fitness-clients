import { useCallback, useState } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import {
  cancelAppointmentInTransaction,
  NotOwnerError,
  TooLateToCancelError,
} from "../../backend/services/appointmentService";

export default function useCancelAppointment() {
  const [isCancelling, setIsCancelling] = useState(false);

  /**
   * Releases one appointment. The cutoff and the ownership check are re-run
   * inside the transaction against the stored document, so a stale screen (or a
   * tampered client) cannot cancel past the deadline or cancel someone else's
   * slot.
   */
  const cancelAppointment = useCallback(
    async (appointmentId, { userId, isAdmin = false } = {}) => {
      if (!appointmentId) return { success: false };

      setIsCancelling(true);
      try {
        await runTransaction(db, (tx) =>
          cancelAppointmentInTransaction({
            tx,
            ref: doc(db, "appointments", appointmentId),
            userId,
            isAdmin,
            timestamp: serverTimestamp,
          }),
        );
        return { success: true };
      } catch (error) {
        if (error instanceof TooLateToCancelError) {
          return { success: false, tooLate: true };
        }
        if (error instanceof NotOwnerError) {
          return { success: false, notOwner: true };
        }
        console.error("Error cancelling appointment:", error);
        return { success: false };
      } finally {
        setIsCancelling(false);
      }
    },
    [],
  );

  return { cancelAppointment, isCancelling };
}
