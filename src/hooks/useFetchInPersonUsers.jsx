import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../backend/config/firebase";

export default function useFetchInPersonUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "user"),
          where("status", "==", "active"),
          where("trainingType", "==", "in_person"),
        );
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { users, loading };
}
