import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useAuth } from "../../context/AuthContext";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import GeneralButton from "../../components/GeneralButton";
import {
  WORK_DAYS,
  MAIN_JOB_START_TIMES,
  getFreeClientTimeText,
  getShiftEndTime,
} from "../../../backend/utils/appointmentConfig";
import { styles } from "../../styles/Admin/StylesAdminTrainerTimeScreen";

const createEmptySchedule = () =>
  WORK_DAYS.reduce((acc, day) => {
    acc[day.key] = null;
    return acc;
  }, {});

export default function AdminTrainerTimeScreen() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(() => createEmptySchedule());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSchedule = async () => {
      try {
        const snapshot = await getDoc(doc(db, "config", "trainerSchedule"));
        if (!isMounted) return;
        setSchedule({
          ...createEmptySchedule(),
          ...(snapshot.data() ?? {}),
        });
      } catch (error) {
        console.error("Error loading main job schedule:", error);
        if (isMounted) {
          Alert.alert("Greška", "Raspored nije učitan.");
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

  const handleSelectTime = (dayKey, time) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: time,
    }));
  };

  const handleClearDay = (dayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: null,
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      await setDoc(doc(db, "config", "trainerSchedule"), schedule, {
        merge: true,
      });
      Alert.alert("Spremljeno", "Vrijeme je uspješno spremljeno.");
    } catch (error) {
      console.error("Error saving main job schedule:", error);
      Alert.alert("Greška", "Vrijeme nije spremljeno.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilePageComponent />
      <View style={styles.container}>
        <Text style={styles.title}>Dodaj vrijeme</Text>
        <Text style={styles.subtitle}>
          Odaberi početak svoje 4-satne smjene za svaki radni dan.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {WORK_DAYS.map((day) => {
              const workStart = schedule[day.key];
              const shiftEnd = getShiftEndTime(workStart);
              const workTimeText = workStart
                ? `${workStart} - ${shiftEnd}`
                : "Ne radite";
              const freeTimeText = getFreeClientTimeText(workStart);

              return (
                <View key={day.key} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>{day.label}</Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeSlider}
                  >
                    <Pressable
                      onPress={() => handleClearDay(day.key)}
                      style={[
                        styles.chip,
                        styles.offChip,
                        !workStart && styles.offChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          styles.offChipText,
                          !workStart && styles.offChipTextActive,
                        ]}
                      >
                        Ne radim
                      </Text>
                    </Pressable>

                    {MAIN_JOB_START_TIMES.map((time) => {
                      const selected = workStart === time;

                      return (
                        <Pressable
                          key={time}
                          onPress={() => handleSelectTime(day.key, time)}
                          style={[styles.chip, selected && styles.chipActive]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              selected && styles.chipTextActive,
                            ]}
                          >
                            {time}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  <View style={styles.summaryRow}>
                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryLabel}>Radno vrijeme</Text>
                      <Text style={styles.summaryValue}>{workTimeText}</Text>
                    </View>

                    <View style={styles.summaryBox}>
                      <Text style={styles.summaryLabel}>Slobodno</Text>
                      <Text style={styles.summaryValue}>{freeTimeText}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={styles.weeklySummaryCard}>
              <Text style={styles.weeklySummaryTitle}>
                Sati u kojima ste slobodni za klijentice:
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

            <GeneralButton
              onPress={handleSave}
              disabled={saving}
              fullWidth
              colors={["#7C3AED", "#7C3AED"]}
            >
              {saving ? "Spremanje..." : "Spremi vrijeme"}
            </GeneralButton>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
