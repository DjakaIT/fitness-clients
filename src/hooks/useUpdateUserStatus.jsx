import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useUpdateUserStatus() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (userId, newStatus) => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      return { success: true };
    } catch (error) {
      console.error("Error updating user status:", error);
      return { success: false };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating };
}
