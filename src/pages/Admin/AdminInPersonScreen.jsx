import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import useFetchUsers from "../../hooks/useFetchUsers";
import useBookedSlots from "../../hooks/useBookedSlots";
import { isNotOver } from "../../hooks/useAppointments";
import {
  formatDateShort,
  toLocalDateString,
} from "../../../backend/utils/appointmentConfig";
import { styles } from "../../styles/Admin/StylesAdminInPersonScreen";
import GeneralButton from "../../components/GeneralButton";

/**
 * Who is coming today, at a glance — before this the trainer had to open
 * every client to find out.
 */
function TodayCard({ names }) {
  const today = useMemo(() => toLocalDateString(), []);
  const { bookedSlots, loading } = useBookedSlots(today, today);
  const sessions = [...(bookedSlots[today] ?? [])]
    .filter((s) => isNotOver({ appointmentDate: today, time: s.time }))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <View style={styles.todayCard}>
      <Text style={styles.todayLabel}>DANAS · {formatDateShort(today)}</Text>
      {loading ? (
        <ActivityIndicator color="#7C3AED" />
      ) : sessions.length === 0 ? (
        <Text style={styles.todayEmpty}>Danas više nema termina.</Text>
      ) : (
        sessions.map((s) => (
          <View key={s.id} style={styles.todayRow}>
            <Text style={styles.todayTime}>{s.time}</Text>
            <Text style={styles.todayName} numberOfLines={1}>
              {names.get(s.userId) ?? "klijentica"}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

export default function AdminInPersonScreen() {
  // Live, so a client approved, switched or removed a moment ago shows here
  // without leaving the screen.
  const { users, loading } = useFetchUsers("in_person");
  const navigation = useNavigation();
  const names = useMemo(
    () => new Map(users.map((u) => [u.id, u.displayName])),
    [users],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("AdminClientSchedule", {
          userId: item.id,
          displayName: item.displayName,
        })
      }
    >
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>
            {item.displayName?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.displayName}</Text>
        <Text style={styles.meta}>🏋️ Osobni trening</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Uživo klijentice</Text>
        <Text style={styles.subtitle}>
          {users.length === 0
            ? "Trenutno nema klijentica na osobnom treningu."
            : `${users.length} klijentic${users.length === 1 ? "a" : "e"} dolazi osobno`}
        </Text>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={<TodayCard names={names} />}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.actionsRow}>
          <GeneralButton
            size="sm"
            style={styles.actionButton}
            colors={["#7C3AED", "#7C3AED"]}
            onPress={() => navigation.navigate("AdminTrainerTime")}
          >
            Uredi vrijeme
          </GeneralButton>

          <GeneralButton
            size="sm"
            style={styles.actionButton}
            colors={["#111827", "#111827"]}
            onPress={() => navigation.navigate("AdminTrainerSavedTime")}
          >
            Prikaži vrijeme
          </GeneralButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
