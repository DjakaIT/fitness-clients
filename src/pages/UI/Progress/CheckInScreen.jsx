import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { writeBatch, doc } from "firebase/firestore";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { db } from "../../../../backend/config/firebase";
import { useAuth } from "../../../context/AuthContext";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";
import useClientMeasurements from "../../../hooks/useClientMeasurements";
import { useCheckInPhotos, useSaveCheckIn } from "../../../hooks/useCheckIn";
import PressableScale from "../../../components/PressableScale";
import PhotoSlot from "../../../components/PhotoSlot";
import { capturePhoto } from "../../../utils/photoCapture";
import {
  formatDateLong,
  toLocalDateString,
  parseLocalDate,
} from "../../../../backend/utils/appointmentConfig";
import {
  MEASUREMENT_FIELDS,
  PHOTO_ANGLES,
  PHOTO_GUIDANCE,
  hasAnyMeasurement,
  measurementDocId,
  photoDocId,
} from "../../../../backend/utils/progress";
import {
  measurementSchema,
  validate,
} from "../../../../backend/utils/appointmentSchemas";
import { makeStyles } from "../../../styles/UI/StylesProgress";

// Falls back to today rather than crashing the screen if `dateStr` is ever
// malformed — e.g. a measurement doc whose `date` field was hand-edited in
// the console — since this runs from a tap with no other error handling.
const shiftDate = (dateStr, delta) => {
  const d = parseLocalDate(dateStr) ?? new Date();
  d.setDate(d.getDate() + delta);
  return toLocalDateString(d);
};

const valuesFrom = (entry) =>
  MEASUREMENT_FIELDS.reduce(
    (acc, f) => ({ ...acc, [f.key]: entry?.[f.key] ?? "" }),
    {},
  );

export default function CheckInScreen({ route, navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const today = toLocalDateString();

  const [date, setDate] = useState(route.params?.date ?? today);
  // null = "show what is saved for this date"; set once the client edits.
  const [editedValues, setEditedValues] = useState(null);
  const [editedPhotos, setEditedPhotos] = useState(null);
  const [busyAngle, setBusyAngle] = useState(null);
  const [formError, setFormError] = useState(null);
  // Chains the measurement fields: finishing one (keyboard next/done) moves
  // to the following one — kilaža → struk → bokovi → grudi → ruke.
  const fieldRefs = useRef([]);
  const focusField = (index) => fieldRefs.current[index]?.focus();
  const [deleting, setDeleting] = useState(false);

  const { measurements } = useClientMeasurements(user?.uid);
  const saved = measurements.find((m) => m.date === date);
  const { photos: savedPhotos, loading: photosLoading } = useCheckInPhotos(
    user?.uid,
    date,
  );
  const { saveCheckIn, isSaving } = useSaveCheckIn();

  // Moving to another date shows that date's entry; unsaved edits for the
  // previous date are discarded rather than silently carried across.
  useEffect(() => {
    setEditedValues(null);
    setEditedPhotos(null);
    setFormError(null);
  }, [date]);

  const values = editedValues ?? valuesFrom(saved);
  const photos = editedPhotos ?? savedPhotos;
  const photoCount = Object.values(photos).filter(Boolean).length;
  const dirty = editedValues !== null || editedPhotos !== null;
  const canSave =
    dirty && (hasAnyMeasurement(values) || photoCount > 0) && !isSaving;

  const setField = (key, text) => {
    setFormError(null);
    setEditedValues({ ...values, [key]: text });
  };

  const addPhoto = (angle) => {
    Alert.alert(angle.label, angle.hint, [
      { text: "Uslikaj", onPress: () => runCapture(angle, "camera") },
      { text: "Iz galerije", onPress: () => runCapture(angle, "library") },
      { text: "Odustani", style: "cancel" },
    ]);
  };

  const runCapture = async (angle, source) => {
    setBusyAngle(angle.key);
    const result = await capturePhoto(source);
    setBusyAngle(null);
    if (result.cancelled) return;
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setFormError(null);
    setEditedPhotos({ ...photos, [angle.key]: result.base64 });
  };

  const removePhoto = (angle) =>
    setEditedPhotos({ ...photos, [angle.key]: null });

  const handleSave = async () => {
    if (!canSave) return;
    const check = validate(measurementSchema, {
      userId: user.uid,
      date,
      ...values,
    });
    if (!check.ok) {
      setFormError(check.error);
      return;
    }
    const result = await saveCheckIn({
      userId: user.uid,
      date,
      values,
      photosBefore: savedPhotos,
      photosAfter: photos,
    });
    if (result.success) navigation.goBack();
    else setFormError("Unos nije spremljen. Provjeri vezu i pokušaj ponovo.");
  };

  // Right to erasure, in the app rather than by e-mail: the whole entry,
  // photos included, goes in one batch.
  const confirmDelete = () =>
    Alert.alert(
      "Obrisati unos?",
      `Mjere i slike za ${formatDateLong(date)} bit će trajno obrisane.`,
      [
        { text: "Odustani", style: "cancel" },
        { text: "Obriši", style: "destructive", onPress: deleteEntry },
      ],
    );

  const deleteEntry = async () => {
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "measurements", measurementDocId(user.uid, date)));
      for (const angle of PHOTO_ANGLES) {
        if (savedPhotos[angle.key]) {
          batch.delete(
            doc(db, "progress_photos", photoDocId(user.uid, date, angle.key)),
          );
        }
      }
      await batch.commit();
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting check-in:", error);
      setFormError("Brisanje nije uspjelo. Pokušaj ponovo.");
    } finally {
      setDeleting(false);
    }
  };

  const title = saved ? "Uredi unos" : "Novi unos";

  return (
    <View style={styles.screen}>
      <StatusBar style={theme.statusBar} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <PressableScale
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Natrag"
              hitSlop={10}
            >
              <CaretLeftIcon size={20} color={theme.textPrimary} />
            </PressableScale>

            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Text style={styles.subtitle}>
              Upiši što izmjeriš — ne moraju sva polja.
            </Text>

            <View style={styles.dateRow}>
              <PressableScale
                style={styles.dateArrow}
                onPress={() => setDate((d) => shiftDate(d, -1))}
                accessibilityRole="button"
                accessibilityLabel="Dan ranije"
              >
                <CaretLeftIcon size={18} color={theme.accent} />
              </PressableScale>
              <Text style={styles.dateText}>{formatDateLong(date)}</Text>
              <PressableScale
                style={[
                  styles.dateArrow,
                  date >= today && styles.dateArrowDisabled,
                ]}
                disabled={date >= today}
                onPress={() => setDate((d) => shiftDate(d, 1))}
                accessibilityRole="button"
                accessibilityLabel="Dan kasnije"
              >
                <CaretRightIcon size={18} color={theme.accent} />
              </PressableScale>
            </View>

            <Text style={styles.sectionLabel}>Mjere</Text>
            <View style={styles.fieldGrid}>
              {MEASUREMENT_FIELDS.map((f, i) => (
                <View key={f.key} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    {f.label} <Text style={styles.fieldUnit}>({f.unit})</Text>
                  </Text>
                  <TextInput
                    ref={(el) => {
                      fieldRefs.current[i] = el;
                    }}
                    style={styles.fieldInput}
                    value={values[f.key]}
                    onChangeText={(t) => setField(f.key, t)}
                    keyboardType="decimal-pad"
                    placeholder="–"
                    placeholderTextColor={theme.textTertiary}
                    maxLength={6}
                    returnKeyType={
                      i === MEASUREMENT_FIELDS.length - 1 ? "done" : "next"
                    }
                    blurOnSubmit={i === MEASUREMENT_FIELDS.length - 1}
                    onSubmitEditing={() => focusField(i + 1)}
                    accessibilityLabel={`${f.label} u ${f.unit}`}
                  />
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Slike · {photoCount} / 4</Text>
            <Text style={styles.guidance}>{PHOTO_GUIDANCE}</Text>
            {photosLoading ? (
              <ActivityIndicator
                color={theme.accent}
                style={{ marginVertical: 24 }}
              />
            ) : (
              <View style={styles.photoGrid}>
                {PHOTO_ANGLES.map((angle) => (
                  <PhotoSlot
                    key={angle.key}
                    angle={angle}
                    base64={photos[angle.key]}
                    busy={busyAngle === angle.key}
                    onAdd={() => addPhoto(angle)}
                    onRemove={() => removePhoto(angle)}
                  />
                ))}
              </View>
            )}

            {!!formError && (
              <Text style={styles.formNote} accessibilityRole="alert">
                {formError}
              </Text>
            )}

            <PressableScale
              style={[
                styles.primaryBtn,
                { marginTop: 24 },
                !canSave && styles.primaryBtnDisabled,
              ]}
              disabled={!canSave}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave, busy: isSaving }}
            >
              {isSaving ? (
                <ActivityIndicator color={theme.onAccent} />
              ) : (
                <Text style={styles.primaryBtnText}>Spremi</Text>
              )}
            </PressableScale>

            {saved && (
              <PressableScale
                style={styles.dangerBtn}
                disabled={deleting}
                onPress={confirmDelete}
                accessibilityRole="button"
              >
                {deleting ? (
                  <ActivityIndicator color={theme.danger} />
                ) : (
                  <Text style={styles.dangerBtnText}>Obriši unos</Text>
                )}
              </PressableScale>
            )}

            <Text style={styles.privacyNote}>
              Slike vidite samo ti i trenerica. Prije spremanja se smanjuju, a
              podaci o lokaciji iz fotografije se uklanjaju.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
