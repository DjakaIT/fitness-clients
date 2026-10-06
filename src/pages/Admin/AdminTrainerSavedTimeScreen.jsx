import React, { useEffect, useMemo, useState } from "react";
import { Alert, ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  WORK_DAYS,
  getFreeClientTimeText,
  normalizeDayBlocks,
  getBookingWindow,
  formatWeekLabel,
} from "../../../backend/utils/appointmentConfig";
import { styles } from "../../styles/Admin/StylesAdminTrainerSavedTimeScreen";
import useBookedSlots from "../../hooks/useBookedSlots";
import useFetchUsers from "../../hooks/useFetchUsers";

const createEmptySchedule = () =>
  WORK_DAYS.reduce((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, {});

export default function AdminTrainerSavedTimeScreen() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(() => createEmptySchedule());
  const [savedWeekStart, setSavedWeekStart] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    weekStart: targetWeekStart,
    weekEnd: targetWeekEnd,
    bookableDates,
  } = useMemo(() => getBookingWindow(), []);
  // Bookings already made for the week on screen, per day — the trainer's
  // agenda next to her availability.
  const { bookedSlots } = useBookedSlots(targetWeekStart, targetWeekEnd);
  const { users: inPersonClients } = useFetchUsers("in_person");
  const names = useMemo(
    () => new Map(inPersonClients.map((u) => [u.id, u.displayName])),
    [inPersonClients],
  );
  const bookedText = (date) => {
    const day = [...(bookedSlots[date] ?? [])].sort((a, b) =>
      a.time.localeCompare(b.time),
    );
    return day.length === 0
      ? "Nema rezervacija"
      : day
          .map((s) => `${s.time} ${names.get(s.userId) ?? "klijentica"}`)
          .join(", ");
  };

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

        const data = snapshot.data() ?? {};
        const days = createEmptySchedule();
        WORK_DAYS.forEach((day) => {
          days[day.key] = normalizeDayBlocks(data[day.key]);
        });
        setSchedule(days);
        setSavedWeekStart(data.weekStart ?? null);
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

  const hasSavedSchedule =
    savedWeekStart !== null ||
    WORK_DAYS.some((day) => schedule[day.key].length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Spremljeno vrijeme</Text>
        <Text style={styles.subtitle}>
          Zadnje spremljeni raspored i tko je rezervirao koji termin.
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
            <View style={styles.weekBanner}>
              <Text style={styles.weekBannerLabel}>
                {savedWeekStart ? "VRIJEDI ZA TJEDAN" : "TJEDAN NIJE OZNAČEN"}
              </Text>
              {savedWeekStart && (
                <Text style={styles.weekBannerValue}>
                  {formatWeekLabel(savedWeekStart)}
                </Text>
              )}
              {savedWeekStart !== targetWeekStart && (
                <Text style={styles.weekBannerWarn}>
                  Klijentice trenutno rezerviraju tjedan{" "}
                  {formatWeekLabel(targetWeekStart)} — ovaj raspored za njih ne
                  vrijedi dok ga ponovno ne spremiš.
                </Text>
              )}
            </View>

            {WORK_DAYS.map((day, index) => {
              const blocks = schedule[day.key];

              return (
                <View key={day.key} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>{day.label}</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Zauzeta</Text>
                    <Text style={styles.infoValue}>
                      {blocks.length > 0
                        ? blocks.map((b) => `${b.start}–${b.end}`).join(", ")
                        : "Slobodna cijeli dan"}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Slobodno za klijentice</Text>
                    <Text style={styles.infoValue}>
                      {getFreeClientTimeText(blocks)}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      Rezervirano ({formatWeekLabel(targetWeekStart)})
                    </Text>
                    <Text style={styles.infoValue}>
                      {bookedText(bookableDates[index])}
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
