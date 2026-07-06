import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import useAddAppointment from "../../../hooks/useAddAppointment";
import useCancelAppointment from "../../../hooks/useCancelAppointment";
import useTrainerSchedule from "../../../hooks/useTrainerSchedule";
import useBookedSlots from "../../../hooks/useBookedSlots";
import {
  CLIENT_APPOINTMENT_START_TIMES,
  getBookingWindow,
  getTrainerWorkStartForDate,
  getFreeClientTimes,
  formatDateShort,
  formatDateLong,
} from "../../../../backend/utils/appointmentConfig";
import { styles } from "../../../styles/UI/InPerson/StylesAddAppointmentScreen";

export default function AddAppointmentScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { addMultipleAppointments, isAdding } = useAddAppointment();
  const { cancelMultiple, isCancelling } = useCancelAppointment();

  const { isOpen, bookableDates, weekStart, weekEnd, nextSaturday } = useMemo(
    () => getBookingWindow(),
    [],
  );

  const { schedule, loading: scheduleLoading } = useTrainerSchedule();
  const { bookedSlots, loading: slotsLoading } = useBookedSlots(
    weekStart,
    weekEnd,
  );

  const [slots, setSlots] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const loading = scheduleLoading || slotsLoading;
  const isBusy = isAdding || isCancelling;

  // Pre-populate from existing bookings once data loads
  useEffect(() => {
    if (loading || initialized) return;
    const existing = [];
    for (const [date, daySlots] of Object.entries(bookedSlots)) {
      const mine = daySlots.find((s) => s.userId === user?.uid);
      if (mine) existing.push({ date, time: mine.time });
    }
    existing.sort((a, b) => a.date.localeCompare(b.date));
    setSlots(existing);
    setInitialized(true);
  }, [loading, initialized, bookedSlots, user?.uid]);

  const addedDates = slots.map((s) => s.date);

  const getDateStatus = (date) => {
    if (addedDates.includes(date)) return "added";
    const workStart = getTrainerWorkStartForDate(schedule, date);
    const trainerFree = getFreeClientTimes(workStart);
    if (!trainerFree.length) return "unavailable";
    const dayBooked = bookedSlots[date] ?? [];
    const takenByOthers = dayBooked
      .filter((b) => b.userId !== user?.uid)
      .map((b) => b.time);
    if (trainerFree.every((t) => takenByOthers.includes(t))) return "full";
    return "available";
  };

  const timesForDate = useMemo(() => {
    if (!selectedDate) return [];
    const workStart = getTrainerWorkStartForDate(schedule, selectedDate);
    const trainerFree = getFreeClientTimes(workStart);
    const dayBooked = bookedSlots[selectedDate] ?? [];

    return CLIENT_APPOINTMENT_START_TIMES.map((time) => {
      const bookedEntry = dayBooked.find((b) => b.time === time);
      const isTrainerFree = trainerFree.includes(time);
      const isTakenByOther = bookedEntry && bookedEntry.userId !== user?.uid;

      return {
        time,
        isTrainerFree,
        isTakenByOther,
        isAvailable: isTrainerFree && !isTakenByOther,
      };
    });
  }, [selectedDate, schedule, bookedSlots, user?.uid]);

  const handleSelectDate = (date) => {
    if (getDateStatus(date) !== "available") return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleAddSlot = () => {
    if (!selectedDate || !selectedTime || slots.length >= 4) return;
    setSlots((prev) =>
      [...prev, { date: selectedDate, time: selectedTime }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleRemoveSlot = (date) => {
    setSlots((prev) => prev.filter((s) => s.date !== date));
    if (selectedDate === date) setSelectedDate(null);
  };

  const canAdd = selectedDate && selectedTime && slots.length < 4;
  const canSubmit = slots.length >= 2 && !isBusy;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    // Find IDs of existing bookings from already-loaded bookedSlots
    const existingIds = Object.values(bookedSlots)
      .flat()
      .filter((s) => s.userId === user?.uid)
      .map((s) => s.id);

    const cancel = await cancelMultiple(existingIds);
    if (!cancel.success) {
      Alert.alert("Greška", "Nije moguće ažurirati raspored. Pokušaj ponovo.");
      return;
    }

    const result = await addMultipleAppointments(
      user.uid,
      user.displayName,
      user.photoURL,
      slots,
    );

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert("Greška", "Termini nisu dodani. Pokušaj ponovo.");
    }
  };

  // ─── Booking closed ─────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <LinearGradient colors={["#4b0622", "#654b55"]} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.container}>
            <Pressable
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>← Natrag</Text>
            </Pressable>
            <Text style={styles.title}>Rezervacija termina</Text>
            <Text style={styles.subtitle}>
              Termini za sljedeći tjedan mogu se rezervirati isključivo subotom.
            </Text>
            <View style={styles.closedCard}>
              <Text style={styles.closedIcon}>📅</Text>
              <Text style={styles.closedTitle}>
                Rezervacija je trenutno zatvorena
              </Text>
              <Text style={styles.closedText}>
                Sljedeće otvaranje rezervacije:
              </Text>
              <Text style={styles.closedDate}>
                {formatDateLong(nextSaturday)}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ─── Booking open ────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={["#4b0622", "#654b55"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Natrag</Text>
          </Pressable>

          <Text style={styles.title}>Rezervacija termina</Text>
          <Text style={styles.subtitle}>
            Tjedan {formatDateShort(weekStart).split(",")[1]?.trim()} –{" "}
            {formatDateShort(weekEnd).split(",")[1]?.trim()}
          </Text>

          {loading ? (
            <ActivityIndicator
              color="#F497BA"
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : schedule === null ? (
            <View style={styles.closedCard}>
              <Text style={styles.closedTitle}>
                Trenerica još nije unijela raspored.
              </Text>
              <Text style={styles.closedText}>Pokušaj malo kasnije.</Text>
            </View>
          ) : (
            <>
              {/* ── Odabrani termini ─────────────────────────────────────── */}
              <Text style={styles.label}>ODABRANI TERMINI</Text>
              <View style={styles.slotsBox}>
                {slots.length === 0 ? (
                  <Text style={styles.slotsEmpty}>
                    Dodaj barem 2 termina za rezervaciju.
                  </Text>
                ) : (
                  slots.map((slot) => (
                    <View key={slot.date} style={styles.slotRow}>
                      <View style={styles.slotInfo}>
                        <Text style={styles.slotDate}>
                          {formatDateLong(slot.date)}
                        </Text>
                        <Text style={styles.slotTime}>{slot.time}</Text>
                      </View>
                      <Pressable
                        style={styles.slotRemoveBtn}
                        onPress={() => handleRemoveSlot(slot.date)}
                      >
                        <Text style={styles.slotRemoveText}>✕</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.counterRow}>
                <Text style={styles.counterText}>{slots.length} / 4</Text>
                {slots.length < 2 && (
                  <Text style={styles.counterHint}>Minimum 2 dana tjedno</Text>
                )}
                {slots.length === 4 && (
                  <Text style={styles.counterHint}>Maksimum dostignut</Text>
                )}
              </View>

              {/* ── Dodaj termin ─────────────────────────────────────────── */}
              {slots.length < 4 && (
                <>
                  <Text style={[styles.label, { marginTop: 24 }]}>
                    ODABERI DAN
                  </Text>
                  <View style={styles.dateList}>
                    {bookableDates.map((date) => {
                      const status = getDateStatus(date);
                      const isSelected = selectedDate === date;

                      return (
                        <Pressable
                          key={date}
                          disabled={status !== "available"}
                          onPress={() => handleSelectDate(date)}
                          style={[
                            styles.dateChip,
                            isSelected && styles.chipActive,
                            status === "added" && styles.chipAdded,
                            (status === "unavailable" || status === "full") &&
                              styles.chipDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dateChipText,
                              isSelected && styles.chipTextActive,
                              status === "added" && styles.chipTextAdded,
                              (status === "unavailable" || status === "full") &&
                                styles.chipTextDisabled,
                            ]}
                          >
                            {formatDateShort(date)}
                          </Text>
                          {status === "added" && (
                            <Text style={styles.addedBadge}>✓</Text>
                          )}
                          {status === "unavailable" && (
                            <Text style={styles.fullBadge}>Zatvoreno</Text>
                          )}
                          {status === "full" && (
                            <Text style={styles.fullBadge}>Popunjeno</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  {selectedDate && (
                    <>
                      <Text style={[styles.label, { marginTop: 4 }]}>
                        ODABERI VRIJEME
                      </Text>
                      <View style={styles.timeGrid}>
                        {timesForDate.map(
                          ({ time, isAvailable, isTakenByOther }) => (
                            <Pressable
                              key={time}
                              disabled={!isAvailable}
                              onPress={() => setSelectedTime(time)}
                              style={[
                                styles.timeChip,
                                selectedTime === time && styles.chipActive,
                                !isAvailable &&
                                  (isTakenByOther
                                    ? styles.chipTaken
                                    : styles.chipDisabled),
                              ]}
                            >
                              <Text
                                style={[
                                  styles.timeChipText,
                                  selectedTime === time &&
                                    styles.chipTextActive,
                                  !isAvailable && styles.chipTextTaken,
                                ]}
                              >
                                {time}
                              </Text>
                            </Pressable>
                          ),
                        )}
                      </View>
                    </>
                  )}

                  <Pressable
                    style={[
                      styles.addSlotBtn,
                      !canAdd && styles.submitBtnDisabled,
                    ]}
                    disabled={!canAdd}
                    onPress={handleAddSlot}
                  >
                    <Text style={styles.addSlotBtnText}>+ Dodaj termin</Text>
                  </Pressable>
                </>
              )}

              {/* ── Submit ───────────────────────────────────────────────── */}
              <Pressable
                style={[
                  styles.submitBtn,
                  { marginTop: 20 },
                  !canSubmit && styles.submitBtnDisabled,
                ]}
                disabled={!canSubmit}
                onPress={handleSubmit}
              >
                {isBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {slots.length >= 2
                      ? "Pošalji raspored"
                      : `Još ${2 - slots.length} termin${2 - slots.length === 1 ? "" : "a"} do minimuma`}
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
