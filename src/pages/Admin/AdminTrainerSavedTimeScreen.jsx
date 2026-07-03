import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useAuth } from "../../context/AuthContext";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import {
  WORK_DAYS,
  getFreeClientTimeText,
  getShiftEndTime,
} from "../../../backend/utils/appointmentConfig";
import { styles } from "../../styles/Admin/StylesAdminTrainerSavedTimeScreen";

const createEmptySchedule = () =>
  WORK_DAYS.reduce((acc, day) => {
    acc[day.key] = null;
    return acc;
  }, {});

export default function AdminTrainerSavedTimeScreen() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(() => createEmptySchedule());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSchedule = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "config", "trainerSchedule"));

        if (!isMounted) return;

        setSchedule({
          ...createEmptySchedule(),
          ...(snapshot.data() ?? {}),
        });
      } catch (error) {
        console.error("Error loading saved trainer time:", error);
        if (isMounted) {
          Alert.alert("Greška", "Vrijeme nije učitano.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const hasSavedSchedule = WORK_DAYS.some((day) => Boolean(schedule[day.key]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilePageComponent />
      <View style={styles.container}>
        <Text style={styles.title}>Spremljeno vrijeme</Text>
        <Text style={styles.subtitle}>
          Ovdje vidiš zadnje spremljeni raspored glavnog posla.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : !hasSavedSchedule ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Još nema spremljenog vremena.</Text>
            <Text style={styles.emptyText}>
              Unesi raspored na ekranu za uređivanje vremena.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {WORK_DAYS.map((day) => {
              const workStart = schedule[day.key];
              const shiftEnd = getShiftEndTime(workStart);

              return (
                <View key={day.key} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>{day.label}</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Radno vrijeme</Text>
                    <Text style={styles.infoValue}>
                      {workStart ? `${workStart} - ${shiftEnd}` : "Ne radite"}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Slobodno za klijentice</Text>
                    <Text style={styles.infoValue}>
                      {getFreeClientTimeText(workStart)}
                    </Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.weeklySummaryCard}>
              <Text style={styles.weeklySummaryTitle}>
                Tjedni pregled slobodnih termina:
              </Text>

              {WORK_DAYS.map((day) => (
                <View key={day.key} style={styles.weeklySummaryRow}>
                  <Text style={styles.weeklySummaryDay}>
                    {day.shortLabel.toUpperCase()}:
                  </Text>
                  <Text style={styles.weeklySummaryText}>
                    {getFreeClientTimeText(schedule[day.key])}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
