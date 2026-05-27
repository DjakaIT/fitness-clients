import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useFetchUsers(trainingType = null) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const constraints = [where("role", "==", "user")];
        if (trainingType) {
          constraints.push(where("trainingType", "==", trainingType));
        }
        const queryUsers = query(collection(db, "users"), ...constraints);
        const querySnapshot = await getDocs(queryUsers);
        setUsers(querySnapshot.docs.map((u) => ({ id: u.id, ...u.data() })));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [trainingType]);

  return { users, loading };
}
