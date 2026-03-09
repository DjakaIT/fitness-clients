import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export function useReviews() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = async (userId, userName, ratings, reflection) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "weekly_review"), {
        userId,
        userName,
        ratings,
        reflection,
        createdAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("Error submitting review:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitReview, isSubmitting };
}
