import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import { canCancel } from "../../backend/utils/appointmentConfig";
export default function useCancelAppointment() {
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelAppointment = async (
    appointmentId,
    appointmentDate,
    time,
    isAdmin = false,
  ) => {
    if (!isAdmin && !canCancel(appointmentDate, time)) {
      return { success: false, tooLate: true };
    }
    setIsCancelling(true);
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "cancelled",
      });
      return { success: true };
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return { success: false };
    } finally {
      setIsCancelling(false);
    }
  };

  return { cancelAppointment, isCancelling };
}
