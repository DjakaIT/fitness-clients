import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { CaretLeft } from "phosphor-react-native";
import { useAuth } from "../../../context/AuthContext";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";
import useSyncAppointments from "../../../hooks/useSyncAppointments";
import useTrainerSchedule from "../../../hooks/useTrainerSchedule";
import useBookedSlots from "../../../hooks/useBookedSlots";
import {
  CLIENT_APPOINTMENT_START_TIMES,
  getBookingWindow,
  formatDateShort,
  formatDateLong,
} from "../../../../backend/utils/appointmentConfig";
import {
  DATE_STATUS,
  SLOT_STATUS,
  getDateStatus,
  getSlotStatus,
  validateSelection,
} from "../../../../backend/utils/bookingRules";
import { BOOKING_POLICY } from "../../../../backend/config/tenant";
import PressableScale from "../../../components/PressableScale";
import { makeStyles } from "../../../styles/UI/InPerson/StylesAddAppointmentScreen";

// Spoken suffixes, so a screen reader hears *why* a chip is unavailable
// instead of just "dimmed button".
const DATE_STATUS_LABEL = {
  [DATE_STATUS.ADDED]: ", odabrano",
  [DATE_STATUS.FULL]: ", popunjeno",
  [DATE_STATUS.UNAVAILABLE]: ", zatvoreno",
};

const SLOT_STATUS_LABEL = {
  [SLOT_STATUS.MINE]: ", tvoj termin",
  [SLOT_STATUS.TAKEN]: ", zauzeto",
  [SLOT_STATUS.TRAINER_BUSY]: ", trenerica nije slobodna",
  [SLOT_STATUS.PAST]: ", termin je prošao",
};

export default function AddAppointmentScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { syncWeek, isSaving } = useSyncAppointments();

  const { bookableDates, weekStart, weekEnd } = useMemo(
    () => getBookingWindow(),
    [],
  );

  const { schedule, loading: scheduleLoading } = useTrainerSchedule();
  const { bookedSlots, loading: slotsLoading } = useBookedSlots(
    weekStart,
    weekEnd,
  );

  const [slots, setSlots] = useState([]);
  // What the client already holds on the server — the baseline the submit diffs
  // against, so untouched bookings are never released and re-taken.
  const [existingSlots, setExistingSlots] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const loading = scheduleLoading || slotsLoading;
  const isBusy = isSaving;
  const { minSlotsPerWeek: MIN_SLOTS, maxSlotsPerWeek: MAX_SLOTS } =
    BOOKING_POLICY;

  // The trainer's schedule counts only if it was saved for exactly this
  // booking week — a schedule from an older week would show wrong times.
  const scheduleIsCurrent = schedule?.weekStart === weekStart;

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
    setExistingSlots(existing);
    setInitialized(true);
  }, [loading, initialized, bookedSlots, user?.uid]);

  const addedDates = slots.map((s) => s.date);

  const dateStatusFor = (date) =>
    getDateStatus({
      date,
      schedule,
      bookedForDate: bookedSlots[date] ?? [],
      userId: user?.uid,
      selectedDates: addedDates,
    });

  const timesForDate = useMemo(() => {
    if (!selectedDate) return [];
    const bookedForDate = bookedSlots[selectedDate] ?? [];

    return CLIENT_APPOINTMENT_START_TIMES.map((time) => {
      const status = getSlotStatus({
        date: selectedDate,
        time,
        schedule,
        bookedForDate,
        userId: user?.uid,
      });
      return {
        time,
        status,
        isTakenByOther: status === SLOT_STATUS.TAKEN,
        isAvailable:
          status === SLOT_STATUS.AVAILABLE || status === SLOT_STATUS.MINE,
      };
    });
  }, [selectedDate, schedule, bookedSlots, user?.uid]);

  const handleSelectDate = (date) => {
    if (dateStatusFor(date) !== DATE_STATUS.AVAILABLE) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleAddSlot = () => {
    if (!selectedDate || !selectedTime || slots.length >= MAX_SLOTS) return;
    setSubmitError(null);
    setSlots((prev) =>
      [...prev, { date: selectedDate, time: selectedTime }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleRemoveSlot = (date) => {
    setSubmitError(null);
    setSlots((prev) => prev.filter((s) => s.date !== date));
    if (selectedDate === date) setSelectedDate(null);
  };

  const canAdd = selectedDate && selectedTime && slots.length < MAX_SLOTS;
  const canSubmit = slots.length >= MIN_SLOTS && !isBusy;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitError(null);

    // Re-check the whole selection against live availability: the client may
    // have had this screen open while somebody else took one of these slots.
    const check = validateSelection(slots, {
      bookableDates,
      schedule,
      bookedSlots,
      userId: user?.uid,
    });
    if (!check.ok) {
      setSubmitError(check.error);
      return;
    }

    const result = await syncWeek(user.uid, slots, existingSlots);

    if (result.success) {
      navigation.goBack();
    } else {
      setSubmitError(result.error);
    }
  };

  // ─── Booking open ────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <StatusBar style={theme.statusBar} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <PressableScale
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Natrag"
            hitSlop={10}
          >
            <CaretLeft size={20} color={theme.textPrimary} />
          </PressableScale>

          <Text style={styles.title}>Rezervacija termina</Text>
          <Text style={styles.subtitle}>
            Tjedan {formatDateShort(weekStart).split(",")[1]?.trim()} –{" "}
            {formatDateShort(weekEnd).split(",")[1]?.trim()}
          </Text>

          {loading ? (
            <ActivityIndicator
              color={theme.accent}
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : !scheduleIsCurrent ? (
            <View style={styles.closedCard}>
              <Text style={styles.closedTitle}>
                Trenerica još nije unijela raspored za ovaj tjedan.
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
                    Dodaj barem {MIN_SLOTS} termina za rezervaciju.
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
                      <PressableScale
                        style={styles.slotRemoveBtn}
                        onPress={() => handleRemoveSlot(slot.date)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ukloni termin ${formatDateLong(slot.date)}`}
                        hitSlop={8}
                      >
                        <Text style={styles.slotRemoveText}>✕</Text>
                      </PressableScale>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.counterRow}>
                <Text style={styles.counterText}>
                  {slots.length} / {MAX_SLOTS}
                </Text>
                {slots.length < MIN_SLOTS && (
                  <Text style={styles.counterHint}>
                    Minimum {MIN_SLOTS} dana tjedno
                  </Text>
                )}
                {slots.length === MAX_SLOTS && (
                  <Text style={styles.counterHint}>Maksimum dostignut</Text>
                )}
              </View>

              {/* ── Dodaj termin ─────────────────────────────────────────── */}
              {slots.length < MAX_SLOTS && (
                <>
                  <Text style={[styles.label, { marginTop: 24 }]}>
                    ODABERI DAN
                  </Text>
                  <View style={styles.dateList}>
                    {bookableDates.map((date) => {
                      const status = dateStatusFor(date);
                      const isSelected = selectedDate === date;

                      return (
                        <PressableScale
                          key={date}
                          disabled={status !== DATE_STATUS.AVAILABLE}
                          onPress={() => handleSelectDate(date)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`${formatDateLong(date)}${DATE_STATUS_LABEL[status] ?? ""}`}
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
                        </PressableScale>
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
                          ({ time, status, isAvailable, isTakenByOther }) => (
                            <PressableScale
                              key={time}
                              disabled={!isAvailable}
                              onPress={() => setSelectedTime(time)}
                              accessibilityRole="button"
                              accessibilityState={{
                                selected: selectedTime === time,
                              }}
                              accessibilityLabel={`${time}${SLOT_STATUS_LABEL[status] ?? ""}`}
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
                            </PressableScale>
                          ),
                        )}
                      </View>
                    </>
                  )}

                  <PressableScale
                    style={[
                      styles.addSlotBtn,
                      !canAdd && styles.submitBtnDisabled,
                    ]}
                    disabled={!canAdd}
                    onPress={handleAddSlot}
                    accessibilityRole="button"
                  >
                    <Text style={styles.addSlotBtnText}>+ Dodaj termin</Text>
                  </PressableScale>
                </>
              )}

              {/* ── Submit ───────────────────────────────────────────────── */}
              {!!submitError && (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorBannerText}>{submitError}</Text>
                </View>
              )}

              <PressableScale
                style={[
                  styles.submitBtn,
                  { marginTop: 20 },
                  !canSubmit && styles.submitBtnDisabled,
                ]}
                disabled={!canSubmit}
                onPress={handleSubmit}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit, busy: isBusy }}
              >
                {isBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {slots.length >= MIN_SLOTS
                      ? "Pošalji raspored"
                      : `Još ${MIN_SLOTS - slots.length} termin${MIN_SLOTS - slots.length === 1 ? "" : "a"} do minimuma`}
                  </Text>
                )}
              </PressableScale>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
