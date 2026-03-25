import { React, useEffect, useState, useMemo } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import UserCard from "../../components/UserCard";
import FilterButton from "../../components/FilterButton";
import SearchBar from "../../components/SearchBar";
import formatClientNumber from "../../../backend/utils/clientNumberUtil";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/Admin/StylesAdminUserListScreen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminUserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const { user } = useAuth();

  const firstName = user?.displayName?.split(" ")[0] || "...";

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

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!searchQuery.trim()) {
      return users;
    } else {
      return users.filter((user) =>
        user.displayName?.toLowerCase().includes(q),
      );
    }
  }, [searchQuery, users]);

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* search and filter, TODO: add filtering logic */}
        <View style={styles.searchRow}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          <FilterButton onPress={() => {}} />
        </View>

        <Text style={styles.title}> Tvoje klijentice</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.subtitleHighlight}>{firstName}</Text>, trenutno s
          tobom napreduje {formatClientNumber(users.length)}
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statNumberPrimary}>{users.length}</Text>
            <Text style={styles.statLabelPrimary}>KLIJENTICA UKUPNO</Text>
          </View>
          <View style={[styles.statCard, styles.statCardLight]}>
            <Text style={styles.statNumberLight}>{users.length}</Text>
            <Text style={styles.statLabelLight}>KLIJENTICA TRENUTNO</Text>
          </View>
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
