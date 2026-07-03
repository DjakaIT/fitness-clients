import React, { useMemo, useState } from "react";
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
  const { addAppointment, isAdding } = useAddAppointment();
  const { cancelAppointment, isCancelling } = useCancelAppointment();

  const { isOpen, bookableDates, weekStart, weekEnd, nextSaturday } = useMemo(
    () => getBookingWindow(),
    [],
  );

  const { schedule, loading: scheduleLoading } = useTrainerSchedule();
  const { bookedSlots, loading: slotsLoading } = useBookedSlots(
    weekStart,
    weekEnd,
  );

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const loading = scheduleLoading || slotsLoading;

  // Find this client's existing booking for the upcoming week
  const existingBooking = useMemo(() => {
    for (const [date, slots] of Object.entries(bookedSlots)) {
      const mine = slots.find((s) => s.userId === user?.uid);
      if (mine) return { id: mine.id, appointmentDate: date, time: mine.time };
    }
    return null;
  }, [bookedSlots, user?.uid]);

  // Times available for the selected date (trainer free − taken by others)
  const timesForDate = useMemo(() => {
    if (!selectedDate) return [];
    const workStart = getTrainerWorkStartForDate(schedule, selectedDate);
    const trainerFree = getFreeClientTimes(workStart);
    const dayBooked = bookedSlots[selectedDate] ?? [];

    return CLIENT_APPOINTMENT_START_TIMES.map((time) => {
      const bookedEntry = dayBooked.find((b) => b.time === time);
      const isTrainerFree = trainerFree.includes(time);
      const isMine = bookedEntry?.userId === user?.uid;
      const isTakenByOther = bookedEntry && !isMine;

      return {
        time,
        isTrainerFree,
        isMine,
        isTakenByOther,
        isAvailable: isTrainerFree && !isTakenByOther,
      };
    });
  }, [selectedDate, schedule, bookedSlots, user?.uid]);

  // Whether a date chip has at least one pickable slot
  const dateHasSlots = (date) => {
    const workStart = getTrainerWorkStartForDate(schedule, date);
    const trainerFree = getFreeClientTimes(workStart);
    const dayBooked = bookedSlots[date] ?? [];
    const takenByOthers = dayBooked
      .filter((b) => b.userId !== user?.uid)
      .map((b) => b.time);
    return trainerFree.some((t) => !takenByOthers.includes(t));
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const canSubmit =
    selectedDate &&
    selectedTime &&
    !(
      existingBooking?.appointmentDate === selectedDate &&
      existingBooking?.time === selectedTime
    );

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (existingBooking) {
      const cancel = await cancelAppointment(
        existingBooking.id,
        existingBooking.appointmentDate,
        existingBooking.time,
        true, // bypass 24hr rule — Saturday rebooking
      );
      if (!cancel.success) {
        Alert.alert("Greška", "Stari termin nije mogao biti otkazan.");
        return;
      }
    }

    const result = await addAppointment(
      user.uid,
      user.displayName,
      user.photoURL,
      selectedDate,
      selectedTime,
    );

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert("Greška", "Termin nije dodan. Pokušaj ponovo.");
    }
  };

  // ─── Booking closed screen ──────────────────────────────────────────────────
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

            {existingBooking && (
              <View style={styles.existingCard}>
                <Text style={styles.existingLabel}>Tvoj trenutni termin</Text>
                <Text style={styles.existingValue}>
                  {formatDateLong(existingBooking.appointmentDate)} u{" "}
                  {existingBooking.time}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ─── Booking open screen ────────────────────────────────────────────────────
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

          <Text style={styles.title}>Novi termin</Text>
          <Text style={styles.subtitle}>
            Odaberi termin za tjedan{" "}
            {formatDateShort(weekStart).split(",")[1]?.trim()} –{" "}
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
              {/* Existing booking notice */}
              {existingBooking && (
                <View style={styles.existingCard}>
                  <Text style={styles.existingLabel}>Tvoj trenutni termin</Text>
                  <Text style={styles.existingValue}>
                    {formatDateLong(existingBooking.appointmentDate)} u{" "}
                    {existingBooking.time}
                  </Text>
                  <Text style={styles.existingHint}>
                    Odaberi drugi termin za promjenu.
                  </Text>
                </View>
              )}

              {/* Date chips */}
              <Text style={styles.label}>DATUM</Text>
              <View style={styles.dateList}>
                {bookableDates.map((date) => {
                  const hasSlots = dateHasSlots(date);
                  const isSelected = selectedDate === date;
                  const isMyDate = existingBooking?.appointmentDate === date;

                  return (
                    <Pressable
                      key={date}
                      disabled={!hasSlots}
                      onPress={() => handleSelectDate(date)}
                      style={[
                        styles.dateChip,
                        isSelected && styles.chipActive,
                        !hasSlots && styles.chipDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          isSelected && styles.chipTextActive,
                          !hasSlots && styles.chipTextDisabled,
                        ]}
                      >
                        {formatDateShort(date)}
                      </Text>
                      {isMyDate && !isSelected && (
                        <Text style={styles.myDateBadge}>tvoj termin</Text>
                      )}
                      {!hasSlots && (
                        <Text style={styles.fullBadge}>popunjeno</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Time grid */}
              {selectedDate && (
                <>
                  <Text style={styles.label}>VRIJEME</Text>
                  <View style={styles.timeGrid}>
                    {timesForDate
                      .filter((t) => t.isTrainerFree)
                      .map(({ time, isMine, isTakenByOther, isAvailable }) => {
                        const isSelected = selectedTime === time;

                        return (
                          <Pressable
                            key={time}
                            disabled={isTakenByOther}
                            onPress={() =>
                              isAvailable || isMine
                                ? setSelectedTime(time)
                                : null
                            }
                            style={[
                              styles.timeChip,
                              isSelected && styles.chipActive,
                              isMine && !isSelected && styles.chipMine,
                              isTakenByOther && styles.chipTaken,
                            ]}
                          >
                            <Text
                              style={[
                                styles.timeChipText,
                                isSelected && styles.chipTextActive,
                                isTakenByOther && styles.chipTextTaken,
                              ]}
                            >
                              {time}
                            </Text>
                            {isTakenByOther && (
                              <Text style={styles.takenLabel}>zauzeto</Text>
                            )}
                            {isMine && !isSelected && (
                              <Text style={styles.mineLabel}>moj</Text>
                            )}
                          </Pressable>
                        );
                      })}
                  </View>
                </>
              )}

              {/* Submit */}
              <Pressable
                style={[
                  styles.submitBtn,
                  (!canSubmit || isAdding || isCancelling) &&
                    styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit || isAdding || isCancelling}
              >
                {isAdding || isCancelling ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {existingBooking ? "Promijeni termin" : "Rezerviraj termin"}
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
