import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useAddAppointment() {
  const [isAdding, setIsAdding] = useState(false);

  const addAppointment = async (
    userId,
    userName,
    userPhoto,
    appointmentDate,
    time,
  ) => {
    setIsAdding(true);
    try {
      await addDoc(collection(db, "appointments"), {
        userId,
        userName,
        userPhoto: userPhoto ?? null,
        appointmentDate,
        time,
        status: "active",
        createdAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error adding appointment:", error);
      return { success: false };
    } finally {
      setIsAdding(false);
    }
  };

  return { addAppointment, isAdding };
}
