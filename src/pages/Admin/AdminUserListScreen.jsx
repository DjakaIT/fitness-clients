import React, { useState, useEffect, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useAuth } from "../../context/AuthContext";
import UserCard from "../../components/UserCard";
import SearchBar from "../../components/SearchBar";
import FilterButton from "../../components/FilterButton";
import formatClientNumber from "../../../backend/utils/clientNumberUtil";

export default function AdminUserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const { user } = useAuth();

  const firstName = user?.displayName?.split(" ")[0] || "Marta";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const queryUsers = query(
          collection(db, "users"),
          where("role", "==", "user"),
        );
        const querySnapshot = await getDocs(queryUsers);
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) => u.displayName?.toLowerCase().includes(q));
  }, [users, searchQuery]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
        <View style={styles.searchRow}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          <FilterButton onPress={() => {}} />
        </View>

        <Text style={styles.title}>Tvoje klijentice</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.subtitleHighlight}>{firstName}</Text>, trenutno s
          tobom napreduje{" "}
          <Text style={styles.clientNumber}>
            {formatClientNumber(users.length)}
          </Text>
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

        <Text style={styles.sectionHeader}>LISTA KLIJENTICA</Text>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  // Title
  title: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 20,
  },
  subtitleHighlight: {
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },
  clientNumber: {
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statCardPrimary: {
    backgroundColor: "#7C3AED",
  },
  statCardLight: {
    backgroundColor: "#fdf2f6",
  },
  statNumberPrimary: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  statLabelPrimary: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.8,
  },
  statNumberLight: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    marginBottom: 2,
  },
  statLabelLight: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
    letterSpacing: 0.8,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 4,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
});
