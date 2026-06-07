import { React, useEffect, useState, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import UserCard from "../../components/UserCard";
import FilterButton from "../../components/FilterButton";
import SearchBar from "../../components/SearchBar";
import formatClientNumber from "../../../backend/utils/clientNumberUtil";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/Admin/StylesAdminUserListScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetchUsers from "../../hooks/useFetchUsers";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import usePendingUsers from "../../hooks/usePendingUsers";
import useUpdateUserStatus from "../../hooks/useUpdateUserStatus";

export default function AdminUserListScreen() {
  const { users, loading } = useFetchUsers("online");
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

  const activeUsers = users.filter((user) => user.status === "active");

  const getClientForm = (count) => {
    if (count === 0 || count === 1 || count >= 5) {
      return "Klijentica";
    }
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (
      (lastDigit === 2 || lastDigit === 3 || lastDigit === 4) &&
      (lastTwoDigits < 10 || lastTwoDigits > 20)
    ) {
      return "Klijentice";
    }
    return "Klijentica";
  };

  const { pendingUsers } = usePendingUsers();
  const { updateStatus, isUpdating } = useUpdateUserStatus();

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

        <Text style={styles.title}> Online klijentice</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.subtitleHighlight}>{firstName}</Text>, trenutno s
          tobom napreduje {formatClientNumber(users.length)}{" "}
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statNumberPrimary}>{users.length}</Text>
            <Text style={styles.statLabelPrimary}>
              {formatClientNumber(users.length)
                .split(" ")
                .slice(1)
                .join(" ")
                .toUpperCase()}{" "}
              UKUPNO
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardLight]}>
            <Text style={styles.statNumberLight}>{activeUsers.length}</Text>
            <Text style={styles.statLabelLight}>
              {formatClientNumber(activeUsers.length)
                .split(" ")
                .slice(1)
                .join(" ")
                .toUpperCase()}{" "}
              TRENUTNO
            </Text>
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
        {pendingUsers.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>ZAHTJEVI ZA PRISTUP</Text>
            {pendingUsers.map((pending) => (
              <View key={pending.id} style={styles.pendingCard}>
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingName}>{pending.displayName}</Text>
                  <Text style={styles.pendingMeta}>
                    {pending.trainingType === "online"
                      ? "💻 Online"
                      : pending.trainingType === "in_person"
                        ? "🏋️ Osobno"
                        : "Tip nije odabran"}
                  </Text>
                </View>
                <Pressable
                  style={[styles.pendingBtn, styles.approveBtn]}
                  onPress={() => updateStatus(pending.id, "active")}
                  disabled={isUpdating}
                >
                  <Text style={styles.approveBtnText}>Odobri</Text>
                </Pressable>
                <Pressable
                  style={[styles.pendingBtn, styles.rejectBtn]}
                  onPress={() => updateStatus(pending.id, "rejected")}
                  disabled={isUpdating}
                >
                  <Text style={styles.rejectBtnText}>Odbij</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
