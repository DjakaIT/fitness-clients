import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfilePageComponent from "../../components/ProfilePageComponent";
import GeneralButton from "../../components/GeneralButton";
import { VIDEOS } from "../../../backend/data/videos";
import useSaveWorkout from "../../hooks/useSaveWorkout";
import useClientWorkouts from "../../hooks/useClientWorkouts";
import {
  getWeekMondayFromOffset,
  formatWeekLabel,
} from "../../../backend/utils/appointmentConfig";
import { styles } from "../../styles/Admin/StylesAdminWorkoutBuilder";

const CATEGORIES = [...new Set(VIDEOS.map((v) => v.category))];

const toTitleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminWorkoutBuilderScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { userId, displayName } = params;
  const { saveWorkout, isSaving } = useSaveWorkout();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(
    () => getWeekMondayFromOffset(weekOffset),
    [weekOffset],
  );

  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [activeTraining, setActiveTraining] = useState(0);
  // { 0: [{exerciseId, name, sets, reps, note}], 1: [...], ... }
  const [trainingExercises, setTrainingExercises] = useState({});
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  // Modal state
  const [modal, setModal] = useState(null); // { id, title, category }
  const [setsInput, setSetsInput] = useState("3");
  const [repsInput, setRepsInput] = useState("12");
  const [noteInput, setNoteInput] = useState("");

  // Load existing workouts for this client + week
  const { workouts: existing, loading: existingLoading } = useClientWorkouts(
    userId,
    weekStart,
  );
  const [prefilled, setPrefilled] = useState(false);

  // Reset when week changes
  useEffect(() => {
    setPrefilled(false);
    setTrainingExercises({});
    setActiveTraining(0);
  }, [weekStart]);

  // Pre-fill from existing saved workouts
  useEffect(() => {
    if (existingLoading || prefilled) return;
    if (existing.length > 0) {
      const filled = {};
      existing.forEach((w) => {
        filled[w.trainingNumber - 1] = w.exercises ?? [];
      });
      setTrainingExercises(filled);
      if (existing[0]?.sessionsPerWeek) {
        setSessionsPerWeek(existing[0].sessionsPerWeek);
      }
    }
    setPrefilled(true);
  }, [existing, existingLoading, prefilled]);

  const filteredExercises = useMemo(
    () => VIDEOS.filter((v) => v.category === activeCategory),
    [activeCategory],
  );

  const currentExercises = trainingExercises[activeTraining] ?? [];

  const openModal = (exercise) => {
    setSetsInput("3");
    setRepsInput("12");
    setNoteInput("");
    setModal(exercise);
  };

  const confirmAdd = () => {
    if (!modal) return;
    setTrainingExercises((prev) => ({
      ...prev,
      [activeTraining]: [
        ...(prev[activeTraining] ?? []),
        {
          exerciseId: modal.id,
          name: modal.title,
          sets: setsInput.trim() || "3",
          reps: repsInput.trim() || "12",
          note: noteInput.trim(),
        },
      ],
    }));
    setModal(null);
  };

  const removeExercise = (index) => {
    setTrainingExercises((prev) => {
      const list = [...(prev[activeTraining] ?? [])];
      list.splice(index, 1);
      return { ...prev, [activeTraining]: list };
    });
  };

  const handleSaveAll = async () => {
    let allOk = true;
    for (let i = 0; i < sessionsPerWeek; i++) {
      const result = await saveWorkout({
        userId,
        weekStart,
        trainingNumber: i + 1,
        sessionsPerWeek,
        exercises: trainingExercises[i] ?? [],
      });
      if (!result.success) {
        allOk = false;
        break;
      }
    }
    if (allOk) {
      Alert.alert("Uspješno ✓", `Program za ${displayName} je poslan.`);
    } else {
      Alert.alert("Greška", "Nije sve uspjelo. Pokušaj ponovo.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfilePageComponent />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Natrag</Text>
          </Pressable>
          <Text style={styles.title}>{displayName}</Text>
          <Text style={styles.subtitle}>Program vježbanja</Text>
        </View>

        {/* Week selector */}
        <View style={styles.weekSelector}>
          <Pressable
            style={styles.weekArrow}
            onPress={() => setWeekOffset((p) => p - 1)}
          >
            <Text style={styles.weekArrowText}>‹</Text>
          </Pressable>
          <Text style={styles.weekLabel}>{formatWeekLabel(weekStart)}</Text>
          <Pressable
            style={styles.weekArrow}
            onPress={() => setWeekOffset((p) => p + 1)}
          >
            <Text style={styles.weekArrowText}>›</Text>
          </Pressable>
        </View>

        {/* Sessions per week */}
        <Text style={styles.sectionLabel}>TRENINZI TJEDNO</Text>
        <View style={styles.sessionsRow}>
          {[2, 3, 4].map((n) => (
            <Pressable
              key={n}
              style={[
                styles.sessionChip,
                sessionsPerWeek === n && styles.sessionChipActive,
              ]}
              onPress={() => {
                setSessionsPerWeek(n);
                setActiveTraining(0);
              }}
            >
              <Text
                style={[
                  styles.sessionChipText,
                  sessionsPerWeek === n && styles.sessionChipTextActive,
                ]}
              >
                {n}×
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Training tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {Array.from({ length: sessionsPerWeek }, (_, i) => (
            <Pressable
              key={i}
              style={[styles.tab, activeTraining === i && styles.tabActive]}
              onPress={() => setActiveTraining(i)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTraining === i && styles.tabTextActive,
                ]}
              >
                Trening {i + 1}
              </Text>
              {(trainingExercises[i]?.length ?? 0) > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {trainingExercises[i].length}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Added exercises */}
        <Text style={styles.sectionLabel}>DODANE VJEŽBE</Text>
        {existingLoading && !prefilled ? (
          <ActivityIndicator
            size="small"
            color="#7C3AED"
            style={{ marginBottom: 12 }}
          />
        ) : currentExercises.length === 0 ? (
          <View style={styles.emptyExercises}>
            <Text style={styles.emptyExercisesText}>
              Nema vježbi za Trening {activeTraining + 1}.{"\n"}Dodaj ih ispod.
            </Text>
          </View>
        ) : (
          <View style={styles.exerciseList}>
            {currentExercises.map((ex, idx) => (
              <View key={`${ex.exerciseId}-${idx}`} style={styles.exerciseCard}>
                <View style={styles.exerciseNumBadge}>
                  <Text style={styles.exerciseNumText}>{idx + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {toTitleCase(ex.name)}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.sets} ser. × {ex.reps} pon.
                    {ex.note ? `  ·  ${ex.note}` : ""}
                  </Text>
                </View>
                <Pressable
                  style={styles.removeBtn}
                  onPress={() => removeExercise(idx)}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Category filter */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
          DODAJ VJEŽBU
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Exercise picker list */}
        {filteredExercises.map((ex) => (
          <Pressable
            key={ex.id}
            style={styles.exercisePickerRow}
            onPress={() => openModal(ex)}
          >
            <Text style={styles.exercisePickerName}>
              {toTitleCase(ex.title)}
            </Text>
            <View style={styles.addExerciseBtn}>
              <Text style={styles.addExerciseBtnText}>+</Text>
            </View>
          </Pressable>
        ))}

        {/* Save */}
        <View style={styles.saveRow}>
          <GeneralButton
            colors={["#7C3AED", "#14b8a6"]}
            onPress={handleSaveAll}
            disabled={isSaving}
            fullWidth
          >
            {isSaving ? "Sprema se..." : "Pošalji program"}
          </GeneralButton>
        </View>
      </ScrollView>

      {/* Add exercise modal */}
      <Modal
        visible={!!modal}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modal ? toTitleCase(modal.title) : ""}
            </Text>
            <Text style={styles.modalSubtitle}>{modal?.category}</Text>

            <View style={styles.modalInputRow}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Serije</Text>
                <TextInput
                  style={styles.modalInput}
                  value={setsInput}
                  onChangeText={setSetsInput}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
              </View>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Ponavljanja</Text>
                <TextInput
                  style={styles.modalInput}
                  value={repsInput}
                  onChangeText={setRepsInput}
                  keyboardType="default"
                  selectTextOnFocus
                />
              </View>
            </View>

            <TextInput
              style={styles.modalNoteInput}
              placeholder="Napomena  (npr. sporo, odmor 60s...)"
              placeholderTextColor="#9CA3AF"
              value={noteInput}
              onChangeText={setNoteInput}
            />

            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setModal(null)}
              >
                <Text style={styles.modalBtnCancelText}>Odustani</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={confirmAdd}
              >
                <Text style={styles.modalBtnConfirmText}>Dodaj</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
