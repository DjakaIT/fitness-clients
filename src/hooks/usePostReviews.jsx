import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../backend/config/firebase";
import { buildReviewDoc } from "../../backend/utils/reviews";

export function usePostReviews() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = async (userId, userName, ratings, reflection) => {
    const review = buildReviewDoc({ userId, userName, ratings, reflection });
    if (!review) return { success: false, incomplete: true };

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "weekly_review"), {
        ...review,
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
