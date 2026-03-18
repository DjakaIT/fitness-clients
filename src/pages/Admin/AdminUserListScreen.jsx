import React from "react";
import { Text, View, FlatList } from "react-native";
import GeneralButton from "../../components/GeneralButton";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import UserCard from "../../components/UserCard";
import FilterButton from "../../components/FilterButton";
import SearchBar from "../../components/SearchBar";
import formatClientNumber from "../../../backend/utils/clientNumberUtil";

export default function AdminUserListScreen() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigation = useNavigation();

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const renderUserCard = ({ item }) => (
    <UserCard
      displayName={item.displayName}
      photoUrl={item.photoURL}
      lastLogin={item.lastLogin}
      onPress={() =>
        navigation.navigate("AdminUserImpression", { userId: item.id })
      }
    />
  );
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ paddingHorizontal: 16, marginTop: 16 }}>
        Tvoje klijentice
      </Text>
      <Text style={{ paddingHorizontal: 16, marginTop: 16 }}>
        Marta, trenutno s tobom napreduje {formatClientNumber(users.length)}
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      />
    </View>
  );
}
