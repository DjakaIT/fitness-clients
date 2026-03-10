import React from "react";
import { Text, View, FlatList } from "react-native";
import GeneralButton from "../../components/GeneralButton";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

export default function AdminUserListScreen() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const queryUsers = query(
          collection(db, "users"),
          where("role", "==", "admin"),
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const renderUserCard = ({ item }) => (
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#ccc" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        {item.displayName}
      </Text>
      <Text style={{ color: "#666" }}>{item.email}</Text>
    </View>
  );
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Korisnici</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
      />
      <GeneralButton onPress={() => navigation.navigate("AdminUserImpression")}>
        PREGLED KORISNIKA
      </GeneralButton>
    </View>
  );
}
