import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import {
  CaretLeftIcon,
  CaretRightIcon,
  BarbellIcon,
} from "phosphor-react-native";
import { useAuth } from "../../../context/AuthContext";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";
import useClientWorkouts from "../../../hooks/useClientWorkouts";
import useVideos from "../../../hooks/useVideos";
import useExerciseLogs, {
  useSaveTrainingLogs,
} from "../../../hooks/useExerciseLogs";
import PressableScale from "../../../components/PressableScale";
import Skeleton from "../../../components/Skeleton";
import {
  getWeekMondayFromOffset,
  formatWeekLabel,
} from "../../../../backend/utils/appointmentConfig";
import {
  WEIGHT_STEP_KG,
  formatWeight,
  parseWeight,
  prefillSets,
  setCountFor,
  stepWeight,
  summarizeSets,
} from "../../../../backend/utils/exerciseLog";
import { makeStyles } from "../../../styles/UI/InPerson/StylesMyWorkoutsScreen";

const toTitleCase = (str = "") =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const pluralVjezba = (n) => {
  if (n % 10 === 1 && n % 100 !== 11) return "vježba";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14))
    return "vježbe";
  return "vježbi";
};

const SAVE_NOTE_MS = 3000;

export default function MyWorkoutsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { byId } = useVideos();
  const { byExercise } = useExerciseLogs(user?.uid);
  const { saveTraining, isSaving } = useSaveTrainingLogs();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(
    () => getWeekMondayFromOffset(weekOffset),
    [weekOffset],
  );
  const [activeTraining, setActiveTraining] = useState(0);

  // What the client has typed but not saved, per exercise slot. Anything not
  // in here shows the prefilled "last time" values.
  const [drafts, setDrafts] = useState({});
  const [note, setNote] = useState(null); // { kind: "ok" | "error", text }

  const { workouts, loading } = useClientWorkouts(user?.uid, weekStart);

  const sessionsPerWeek = workouts[0]?.sessionsPerWeek ?? workouts.length ?? 0;
  const currentWorkout = workouts.find(
    (w) => w.trainingNumber === activeTraining + 1,
  );
  const exercises = currentWorkout?.exercises ?? [];
  const slotKey = (idx) => `${weekStart}#${activeTraining}#${idx}`;

  useEffect(() => {
    if (!note) return undefined;
    const t = setTimeout(() => setNote(null), SAVE_NOTE_MS);
    return () => clearTimeout(t);
  }, [note]);

  const valuesFor = (ex, idx) =>
    drafts[slotKey(idx)] ??
    prefillSets(
      byExercise.get(String(ex.exerciseId)),
      setCountFor(ex.sets),
    ).map(formatWeight);

  const setValue = (ex, idx, setIndex, text) => {
    const next = [...valuesFor(ex, idx)];
    next[setIndex] = text;
    setDrafts((d) => ({ ...d, [slotKey(idx)]: next }));
  };

  // Progressive overload in one tap: every set that has a weight moves by the
  // same step. Blank sets stay blank.
  const nudge = (ex, idx, direction) => {
    const next = valuesFor(ex, idx).map((text) => {
      const value = parseWeight(text);
      return typeof value === "number" && !Number.isNaN(value)
        ? formatWeight(stepWeight(value, direction))
        : text;
    });
    setDrafts((d) => ({ ...d, [slotKey(idx)]: next }));
  };

  const dirty = exercises.some((_, idx) => drafts[slotKey(idx)]);
  const anyInvalid = exercises.some((ex, idx) =>
    valuesFor(ex, idx).some((text) => Number.isNaN(parseWeight(text))),
  );

  const handleSave = async () => {
    if (!dirty || anyInvalid || isSaving) return;
    const entries = exercises.map((ex, idx) => ({
      exerciseId: String(ex.exerciseId),
      exerciseName: ex.name,
      sets: valuesFor(ex, idx).map(parseWeight),
    }));
    const result = await saveTraining({
      userId: user?.uid,
      weekStart,
      trainingNumber: activeTraining + 1,
      entries,
    });
    if (result.success) {
      setDrafts((d) => {
        const next = { ...d };
        exercises.forEach((_, idx) => delete next[slotKey(idx)]);
        return next;
      });
      setNote({ kind: "ok", text: "Kilaže spremljene ✓" });
    } else {
      setNote({
        kind: "error",
        text: "Nije spremljeno. Provjeri vezu i pokušaj ponovo.",
      });
    }
  };

  const switchWeek = (delta) => {
    setWeekOffset((p) => p + delta);
    setActiveTraining(0);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style={theme.statusBar} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
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
            Moji treninzi
          </Text>

          <View style={styles.weekSelector}>
            <PressableScale
              style={styles.weekArrow}
              onPress={() => switchWeek(-1)}
              accessibilityRole="button"
              accessibilityLabel="Prethodni tjedan"
            >
              <CaretLeftIcon size={18} color={theme.accent} />
            </PressableScale>
            <View style={styles.weekCenter}>
              <Text style={styles.weekLabel}>{formatWeekLabel(weekStart)}</Text>
              {weekOffset === 0 && (
                <Text style={styles.weekBadge}>OVAJ TJEDAN</Text>
              )}
            </View>
            <PressableScale
              style={styles.weekArrow}
              onPress={() => switchWeek(1)}
              accessibilityRole="button"
              accessibilityLabel="Sljedeći tjedan"
            >
              <CaretRightIcon size={18} color={theme.accent} />
            </PressableScale>
          </View>

          {loading ? (
            <View style={styles.exerciseList}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} style={{ height: 92 }} radius={22} />
              ))}
            </View>
          ) : workouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <BarbellIcon
                size={40}
                weight="duotone"
                color={theme.accent}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>
                Nema programa za ovaj tjedan
              </Text>
              <Text style={styles.emptyText}>
                Trenerica još nije poslala program.{"\n"}Provjeri opet uskoro.
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabRow}
              >
                {Array.from({ length: sessionsPerWeek }, (_, i) => (
                  <PressableScale
                    key={i}
                    style={[
                      styles.tab,
                      activeTraining === i && styles.tabActive,
                    ]}
                    onPress={() => setActiveTraining(i)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activeTraining === i }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTraining === i && styles.tabTextActive,
                      ]}
                    >
                      Trening {i + 1}
                    </Text>
                  </PressableScale>
                ))}
              </ScrollView>

              {exercises.length > 0 && (
                <Text style={styles.countCaption}>
                  {exercises.length} {pluralVjezba(exercises.length)}
                </Text>
              )}

              {exercises.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    Nema vježbi za ovaj trening.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.exerciseList}>
                    {exercises.map((ex, idx) => (
                      <ExerciseCard
                        key={`${ex.exerciseId}-${idx}`}
                        ex={ex}
                        idx={idx}
                        styles={styles}
                        theme={theme}
                        video={byId.get(String(ex.exerciseId))}
                        log={byExercise.get(String(ex.exerciseId))}
                        isThisSession={(log) =>
                          log?.lastWeekStart === weekStart &&
                          log?.lastTrainingNumber === activeTraining + 1
                        }
                        values={valuesFor(ex, idx)}
                        onChange={(setIndex, text) =>
                          setValue(ex, idx, setIndex, text)
                        }
                        onNudge={(dir) => nudge(ex, idx, dir)}
                        onOpenVideo={(video) =>
                          navigation.navigate("WorkoutVideo", { video })
                        }
                      />
                    ))}
                  </View>

                  <View style={styles.saveBar}>
                    <PressableScale
                      style={[
                        styles.saveBtn,
                        (!dirty || anyInvalid) && styles.saveBtnDisabled,
                      ]}
                      disabled={!dirty || anyInvalid || isSaving}
                      onPress={handleSave}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: !dirty || anyInvalid,
                        busy: isSaving,
                      }}
                    >
                      {isSaving ? (
                        <ActivityIndicator color={theme.onAccent} />
                      ) : (
                        <Text style={styles.saveBtnText}>Spremi kilaže</Text>
                      )}
                    </PressableScale>
                    {anyInvalid ? (
                      <Text
                        style={[styles.saveNote, styles.saveNoteError]}
                        accessibilityRole="alert"
                      >
                        Kilaža mora biti broj do 500 (npr. 22,5).
                      </Text>
                    ) : note ? (
                      <Text
                        style={[
                          styles.saveNote,
                          note.kind === "ok"
                            ? styles.saveNoteOk
                            : styles.saveNoteError,
                        ]}
                        accessibilityRole="alert"
                      >
                        {note.text}
                      </Text>
                    ) : (
                      <Text style={styles.saveNote}>
                        Upiši kilaže nakon treninga — idući put ih vidiš ovdje.
                      </Text>
                    )}
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ExerciseCard({
  ex,
  idx,
  styles,
  theme,
  video,
  log,
  isThisSession,
  values,
  onChange,
  onNudge,
  onOpenVideo,
}) {
  const last = summarizeSets(log?.lastSets);
  const lastLabel = isThisSession(log) ? "Upisano" : "Zadnji put";
  const hasAnyWeight = values.some((v) => typeof parseWeight(v) === "number");

  return (
    <View style={styles.exerciseShell}>
      <PressableScale
        style={styles.exerciseHeader}
        disabled={!video}
        onPress={() => video && onOpenVideo(video)}
        accessibilityRole={video ? "button" : undefined}
        accessibilityLabel={`${toTitleCase(ex.name)}, ${ex.sets} serije po ${ex.reps}${video ? ", otvori video" : ""}`}
      >
        <View style={styles.exerciseNum}>
          <Text style={styles.exerciseNumText}>{idx + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{toTitleCase(ex.name)}</Text>
          <Text style={styles.exerciseMeta}>
            {ex.sets} serije × {ex.reps} ponavljanja
          </Text>
          {ex.note ? <Text style={styles.exerciseNote}>{ex.note}</Text> : null}
        </View>
        {video && <CaretRightIcon size={18} color={theme.textTertiary} />}
      </PressableScale>

      <View style={styles.weights}>
        <View style={styles.weightsTop}>
          <Text style={styles.lastTime} numberOfLines={1}>
            {last ? `${lastLabel}: ${last}` : "Kilaža po seriji"}
          </Text>
          <View style={styles.nudgeRow}>
            {[-1, 1].map((dir) => (
              <PressableScale
                key={dir}
                style={[styles.nudgeBtn, !hasAnyWeight && { opacity: 0.4 }]}
                disabled={!hasAnyWeight}
                onPress={() => onNudge(dir)}
                accessibilityRole="button"
                accessibilityLabel={`${dir > 0 ? "Povećaj" : "Smanji"} sve serije za ${formatWeight(WEIGHT_STEP_KG)} kilograma`}
              >
                <Text style={styles.nudgeText}>
                  {dir > 0 ? "+" : "−"}
                  {formatWeight(WEIGHT_STEP_KG)}
                </Text>
              </PressableScale>
            ))}
          </View>
        </View>

        <View style={styles.setRow}>
          {values.map((text, setIndex) => {
            const invalid = Number.isNaN(parseWeight(text));
            return (
              <View key={setIndex} style={styles.setBox}>
                <Text style={styles.setLabel}>S{setIndex + 1}</Text>
                <TextInput
                  style={[styles.setInput, invalid && styles.setInputInvalid]}
                  value={text}
                  onChangeText={(t) => onChange(setIndex, t)}
                  keyboardType="decimal-pad"
                  placeholder="–"
                  placeholderTextColor={theme.textTertiary}
                  maxLength={6}
                  selectTextOnFocus
                  accessibilityLabel={`Serija ${setIndex + 1}, kilogrami`}
                />
              </View>
            );
          })}
          <Text style={styles.kgUnit}>kg</Text>
        </View>
      </View>
    </View>
  );
}
