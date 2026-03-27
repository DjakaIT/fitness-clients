import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useFetchReviews(userId) {
  const [reviews, setReviews] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchReview = async () => {
      try {
        const queryReviews = query(
          collection(db, "weekly_review"),
          where("userId", "==", userId),
        );
        const querySnapshot = await getDocs(queryReviews);
        const reviewList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewList);
      } catch (error) {
        console.error("Error getting review:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchReview();
  }, [userId]);

  return { reviews, isFetching };
}
