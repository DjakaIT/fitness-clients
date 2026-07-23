import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../backend/config/firebase";
import { useAuth } from "../../context/AuthContext";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import GeneralButton from "../../components/GeneralButton";
import ConfirmSheet from "../../components/ConfirmSheet";
import {
  WORK_DAYS,
  BLOCK_TIMES,
  normalizeDayBlocks,
  getFreeClientTimeText,
  getBookingWindow,
  formatWeekLabel,
} from "../../../backend/utils/appointmentConfig";
import { styles } from "../../styles/Admin/StylesAdminTrainerTimeScreen";

const timeToMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const createEmptySchedule = () =>
  WORK_DAYS.reduce((acc, day) => {
    acc[day.key] = [];
    return acc;
  }, {});

export default function AdminTrainerTimeScreen() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(() => createEmptySchedule());
  const [savedWeekStart, setSavedWeekStart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | success | error

  // Add-block modal state
  const [addDay, setAddDay] = useState(null); // dayKey or null
  const [newStart, setNewStart] = useState(null);
  const [newEnd, setNewEnd] = useState(null);

  const { weekStart: targetWeekStart } = useMemo(() => getBookingWindow(), []);

  useEffect(() => {
    let isMounted = true;

    const loadSchedule = async () => {
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
        console.error("Error loading schedule:", error);
        if (isMounted) Alert.alert("Greška", "Raspored nije učitan.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const openAdd = (dayKey) => {
    setAddDay(dayKey);
    setNewStart(null);
    setNewEnd(null);
  };
  const closeAdd = () => setAddDay(null);

  const confirmAdd = () => {
    if (!addDay || !newStart || !newEnd) return;
    setSchedule((prev) => ({
      ...prev,
      [addDay]: [...prev[addDay], { start: newStart, end: newEnd }].sort(
        (a, b) => timeToMin(a.start) - timeToMin(b.start),
      ),
    }));
    closeAdd();
  };

  const removeBlock = (dayKey, index) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: prev[dayKey].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaveState("saving");
    try {
      await setDoc(doc(db, "config", "trainerSchedule"), {
        ...schedule,
        weekStart: targetWeekStart,
        updatedAt: serverTimestamp(),
      });
      setSavedWeekStart(targetWeekStart);
      setSaveState("success");
    } catch (error) {
      console.error("Error saving schedule:", error);
      setSaveState("error");
    }
  };

  const closeSheet = () => {
    setShowConfirm(false);
    setSaveState("idle");
  };

  const busyDaysCount = WORK_DAYS.filter(
    (day) => schedule[day.key].length > 0,
  ).length;

  const validNewBlock =
    newStart && newEnd && timeToMin(newEnd) > timeToMin(newStart);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilePageComponent />
      <View style={styles.container}>
        <Text style={styles.title}>Dodaj vrijeme</Text>
        <Text style={styles.subtitle}>
          Označi kad si zauzeta (glavni posao, obveze). Klijentice vide
          preostalo slobodno vrijeme.
        </Text>

        <View style={styles.weekBanner}>
          <Text style={styles.weekBannerLabel}>VRIJEDI ZA TJEDAN</Text>
          <Text style={styles.weekBannerValue}>
            {formatWeekLabel(targetWeekStart)}
          </Text>
          {!loading && savedWeekStart !== targetWeekStart && (
            <Text style={styles.weekBannerWarn}>
              {savedWeekStart
                ? "Spremljeni raspored je za stariji tjedan — klijentice ga ne vide. Spremi ga ponovno za ovaj interval."
                : "Raspored za ovaj tjedan još nije spremljen — klijentice ne mogu rezervirati termine."}
            </Text>
          )}
          {!loading && savedWeekStart === targetWeekStart && (
            <Text style={styles.weekBannerOk}>
              ✓ Klijentice vide ovaj raspored pri rezervaciji.
            </Text>
          )}
        </View>

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
              const blocks = schedule[day.key];
              return (
                <View key={day.key} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>{day.label}</Text>

                  {blocks.length > 0 ? (
                    <View style={styles.blocksWrap}>
                      {blocks.map((b, i) => (
                        <View
                          key={`${b.start}-${b.end}-${i}`}
                          style={styles.blockPill}
                        >
                          <Text style={styles.blockPillText}>
                            {b.start} – {b.end}
                          </Text>
                          <Pressable
                            style={styles.blockRemoveBtn}
                            onPress={() => removeBlock(day.key, i)}
                            hitSlop={6}
                          >
                            <Text style={styles.blockRemoveText}>✕</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noBlocks}>
                      Nema zauzeća — slobodna cijeli dan.
                    </Text>
                  )}

                  <Pressable
                    style={styles.addBlockBtn}
                    onPress={() => openAdd(day.key)}
                  >
                    <Text style={styles.addBlockBtnText}>+ Dodaj vrijeme</Text>
                  </Pressable>

                  <View style={styles.freeRow}>
                    <Text style={styles.freeLabel}>SLOBODNO ZA KLIJENTICE</Text>
                    <Text style={styles.freeValue}>
                      {getFreeClientTimeText(blocks)}
                    </Text>
                  </View>
                </View>
              );
            })}

            <GeneralButton
              onPress={() => setShowConfirm(true)}
              fullWidth
              colors={["#7C3AED", "#7C3AED"]}
              style={{ marginTop: 8, marginBottom: 24 }}
            >
              Spremi vrijeme
            </GeneralButton>
          </ScrollView>
        )}
      </View>

      {/* Add-block bottom sheet */}
      <Modal
        visible={addDay !== null}
        transparent
        animationType="slide"
        onRequestClose={closeAdd}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Dodaj vrijeme</Text>
            <Text style={styles.modalSubtitle}>
              {WORK_DAYS.find((d) => d.key === addDay)?.label}
            </Text>

            <Text style={styles.pickerLabel}>POČETAK</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerScroll}
            >
              {BLOCK_TIMES.slice(0, -1).map((t) => {
                const selected = newStart === t;
                return (
                  <Pressable
                    key={t}
                    style={[
                      styles.pickerChip,
                      selected && styles.pickerChipActive,
                    ]}
                    onPress={() => {
                      setNewStart(t);
                      if (newEnd && timeToMin(newEnd) <= timeToMin(t)) {
                        setNewEnd(null);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerChipText,
                        selected && styles.pickerChipTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.pickerLabel}>KRAJ</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerScroll}
            >
              {BLOCK_TIMES.map((t) => {
                const disabled =
                  !newStart || timeToMin(t) <= timeToMin(newStart);
                const selected = newEnd === t;
                return (
                  <Pressable
                    key={t}
                    disabled={disabled}
                    style={[
                      styles.pickerChip,
                      selected && styles.pickerChipActive,
                      disabled && styles.pickerChipDisabled,
                    ]}
                    onPress={() => setNewEnd(t)}
                  >
                    <Text
                      style={[
                        styles.pickerChipText,
                        selected && styles.pickerChipTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {!newStart && (
              <Text style={styles.modalError}>Odaberi početak zauzeća.</Text>
            )}

            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={closeAdd}
              >
                <Text style={styles.modalBtnCancelText}>Odustani</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalBtn,
                  styles.modalBtnConfirm,
                  !validNewBlock && styles.modalBtnDisabled,
                ]}
                disabled={!validNewBlock}
                onPress={confirmAdd}
              >
                <Text style={styles.modalBtnConfirmText}>Dodaj</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmSheet
        visible={showConfirm}
        status={saveState}
        onConfirm={handleSave}
        onClose={closeSheet}
        title="Spremi raspored?"
        subtitle={`Vrijedi za tjedan ${formatWeekLabel(targetWeekStart)}. Zauzeta si ${busyDaysCount} od 5 radnih dana.`}
        confirmLabel="Spremi"
        successTitle="Spremljeno ✓"
        successSubtitle="Raspored je ažuriran."
        errorTitle="Nije spremljeno"
        errorSubtitle="Provjeri internet vezu i pokušaj ponovo."
      >
        {WORK_DAYS.map((day) => (
          <View key={day.key} style={styles.recapRow}>
            <Text style={styles.recapDay}>{day.shortLabel.toUpperCase()}</Text>
            <Text
              style={[
                styles.recapValue,
                schedule[day.key].length === 0 && styles.recapValueOff,
              ]}
            >
              {schedule[day.key].length === 0
                ? "Slobodna"
                : schedule[day.key]
                    .map((b) => `${b.start}–${b.end}`)
                    .join(", ")}
            </Text>
          </View>
        ))}
      </ConfirmSheet>
    </SafeAreaView>
  );
}
