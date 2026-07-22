import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import GeneralButton from "../../components/GeneralButton";
import useClientWorkouts from "../../hooks/useClientWorkouts";
import {
  getWeekMondayFromOffset,
  formatWeekLabel,
} from "../../../backend/utils/appointmentConfig";

const toTitleCase = (str = "") =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminClientProgramsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { userId, displayName } = params ?? {};

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(
    () => getWeekMondayFromOffset(weekOffset),
    [weekOffset],
  );

  const { workouts, loading } = useClientWorkouts(userId, weekStart);

  const totalExercises = workouts.reduce(
    (sum, w) => sum + (w.exercises?.length ?? 0),
    0,
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <ProfilePageComponent />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={s.back}>← Natrag</Text>
        </Pressable>
        <Text style={s.title}>{displayName}</Text>
        <Text style={s.subtitle}>Pregled programa</Text>

        {/* Week selector */}
        <View style={s.weekSelector}>
          <Pressable
            style={s.weekArrow}
            onPress={() => setWeekOffset((p) => p - 1)}
            hitSlop={8}
          >
            <Text style={s.weekArrowText}>‹</Text>
          </Pressable>
          <View style={s.weekLabelWrap}>
            <Text style={s.weekLabel}>{formatWeekLabel(weekStart)}</Text>
            {weekOffset === 0 && <Text style={s.weekBadge}>OVAJ TJEDAN</Text>}
          </View>
          <Pressable
            style={s.weekArrow}
            onPress={() => setWeekOffset((p) => p + 1)}
            hitSlop={8}
          >
            <Text style={s.weekArrowText}>›</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7C3AED"
            style={{ marginTop: 48 }}
          />
        ) : workouts.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🗓️</Text>
            <Text style={s.emptyTitle}>Nema programa za ovaj tjedan</Text>
            <Text style={s.emptyText}>
              Kreiraj program pomoću gumba „Novi program".
            </Text>
            <GeneralButton
              colors={["#7C3AED", "#6D28D9"]}
              style={{ marginTop: 18 }}
              onPress={() =>
                navigation.navigate("AdminWorkoutBuilder", {
                  userId,
                  displayName,
                })
              }
            >
              Kreiraj program
            </GeneralButton>
          </View>
        ) : (
          <>
            <View style={s.overviewRow}>
              <View style={s.overviewPill}>
                <Text style={s.overviewNum}>{workouts.length}</Text>
                <Text style={s.overviewLabel}>treninga</Text>
              </View>
              <View style={s.overviewPill}>
                <Text style={s.overviewNum}>{totalExercises}</Text>
                <Text style={s.overviewLabel}>vježbi</Text>
              </View>
            </View>

            {workouts.map((training) => (
              <View key={training.id} style={s.trainingCard}>
                <View style={s.trainingHeader}>
                  <Text style={s.trainingTitle}>
                    Trening {training.trainingNumber}
                  </Text>
                  <View style={s.trainingCountBadge}>
                    <Text style={s.trainingCountText}>
                      {training.exercises?.length ?? 0}
                    </Text>
                  </View>
                </View>

                {(training.exercises?.length ?? 0) === 0 ? (
                  <Text style={s.trainingEmpty}>Nema vježbi.</Text>
                ) : (
                  training.exercises.map((ex, idx) => (
                    <View
                      key={`${ex.exerciseId}-${idx}`}
                      style={[
                        s.exerciseRow,
                        idx === training.exercises.length - 1 && s.exerciseRowLast,
                      ]}
                    >
                      <View style={s.exerciseNum}>
                        <Text style={s.exerciseNumText}>{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.exerciseName}>
                          {toTitleCase(ex.name)}
                        </Text>
                        {!!ex.note && (
                          <Text style={s.exerciseNote}>{ex.note}</Text>
                        )}
                      </View>
                      <View style={s.exerciseMetaWrap}>
                        <Text style={s.exerciseMeta}>
                          {ex.sets} × {ex.reps}
                        </Text>
                        <Text style={s.exerciseMetaSub}>ser. × pon.</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ))}

            <GeneralButton
              colors={["#7C3AED", "#6D28D9"]}
              fullWidth
              style={{ marginTop: 8 }}
              onPress={() =>
                navigation.navigate("AdminWorkoutBuilder", {
                  userId,
                  displayName,
                })
              }
            >
              Uredi program
            </GeneralButton>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F8" },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  back: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 18,
  },
  weekSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  weekArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  weekArrowText: {
    fontSize: 22,
    color: "#7C3AED",
    fontFamily: "Inter_600SemiBold",
    lineHeight: 26,
  },
  weekLabelWrap: { alignItems: "center" },
  weekLabel: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
  },
  weekBadge: {
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 0.5,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },
  overviewRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  overviewPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    paddingVertical: 12,
  },
  overviewNum: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    color: "#7C3AED",
  },
  overviewLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  trainingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  trainingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  trainingTitle: {
    fontSize: 17,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#111827",
  },
  trainingCountBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  trainingCountText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#7C3AED",
  },
  trainingEmpty: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    paddingVertical: 8,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  exerciseRowLast: { borderBottomWidth: 0 },
  exerciseNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#EEF0F2",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseNumText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#6B7280",
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  exerciseNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },
  exerciseMetaWrap: { alignItems: "flex-end" },
  exerciseMeta: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#7C3AED",
  },
  exerciseMetaSub: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#B0B4BB",
    marginTop: 1,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    padding: 28,
    alignItems: "center",
    marginTop: 12,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
});
