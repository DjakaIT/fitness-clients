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
import useFetchUsers from "../../hooks/useFetchUsers";
import ProfilePageComponent from "../../components/ProfilePageComponent";

export default function AdminUserListScreen() {
  const { users, loading } = useFetchUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const { user } = useAuth();

  const firstName = user?.displayName?.split(" ")[0] || "...";

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
        navigation.navigate("AdminUserImpression", {
          userId: item.id,
          displayName: item.displayName,
        })
      }
    />
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilePageComponent />
      <View style={styles.container}>
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
