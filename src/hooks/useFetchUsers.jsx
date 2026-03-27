import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useFetchUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const queryUsers = query(
          collection(db, "users"),
          where("role", "==", "user"),
        );
        const querySnapshot = await getDocs(queryUsers);
        const userList = querySnapshot.docs.map((user) => ({
          id: user.id,
          ...user.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, loading };
}
