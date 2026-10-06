import { useState, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
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
import usePendingUsers from "../../hooks/usePendingUsers";
import useUpdateUserStatus from "../../hooks/useUpdateUserStatus";

const TRAINING_TYPE_LABEL = {
  online: "💻 Online",
  in_person: "🏋️ Osobno",
};

export default function AdminUserListScreen() {
  // Approved online clients only — requests are listed separately above.
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

  const { pendingUsers } = usePendingUsers();
  const { updateStatus, isUpdating } = useUpdateUserStatus();

  const decide = async (pending, newStatus) => {
    const result = await updateStatus(pending.id, newStatus);
    if (!result.success) {
      Alert.alert(
        "Nije spremljeno",
        "Odluka nije spremljena. Provjeri vezu i pokušaj ponovo.",
      );
    }
  };

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
        navigation.navigate("AdminClientGeneralScreen", {
          userId: item.id,
          displayName: item.displayName,
          photoURL: item.photoURL,
        })
      }
    />
  );

  // Requests sit at the top of the scrolling list: below a long client list
  // they used to fall off-screen, unreachable.
  const pendingSection =
    pendingUsers.length > 0 ? (
      <View style={styles.pendingSection}>
        <Text style={styles.sectionHeader}>ZAHTJEVI ZA PRISTUP</Text>
        {pendingUsers.map((pending) => {
          // Approving before she picks online/in person would leave her in
          // neither client list, and in-person booking hinges on the type.
          const hasType = !!TRAINING_TYPE_LABEL[pending.trainingType];
          return (
            <View key={pending.id} style={styles.pendingCard}>
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingName}>
                  {pending.displayName || pending.email || "Bez imena"}
                </Text>
                <Text style={styles.pendingMeta}>
                  {hasType
                    ? TRAINING_TYPE_LABEL[pending.trainingType]
                    : "Još bira vrstu treninga"}
                </Text>
              </View>
              <Pressable
                style={[
                  styles.pendingBtn,
                  styles.approveBtn,
                  (!hasType || isUpdating) && styles.pendingBtnDisabled,
                ]}
                onPress={() => decide(pending, "active")}
                disabled={!hasType || isUpdating}
                accessibilityRole="button"
                accessibilityState={{ disabled: !hasType || isUpdating }}
              >
                <Text style={styles.approveBtnText}>Odobri</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.pendingBtn,
                  styles.rejectBtn,
                  isUpdating && styles.pendingBtnDisabled,
                ]}
                onPress={() => decide(pending, "rejected")}
                disabled={isUpdating}
                accessibilityRole="button"
              >
                <Text style={styles.rejectBtnText}>Odbij</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.statNumberLight}>{pendingUsers.length}</Text>
            <Text style={styles.statLabelLight}>NA ČEKANJU</Text>
          </View>
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          ListHeaderComponent={pendingSection}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
