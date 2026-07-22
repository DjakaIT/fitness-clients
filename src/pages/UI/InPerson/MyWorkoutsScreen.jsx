import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { CaretLeft, CaretRight, Barbell } from "phosphor-react-native";
import { useAuth } from "../../../context/AuthContext";
import { useTheme, useThemedStyles } from "../../../context/ThemeContext";
import useClientWorkouts from "../../../hooks/useClientWorkouts";
import {
  getWeekMondayFromOffset,
  formatWeekLabel,
} from "../../../../backend/utils/appointmentConfig";
import { makeStyles } from "../../../styles/UI/InPerson/StylesMyWorkoutsScreen";
import { VIDEOS } from "../../../../backend/data/videos";

const toTitleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const pluralVjezba = (n) => {
  if (n % 10 === 1 && n % 100 !== 11) return "vježba";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14))
    return "vježbe";
  return "vježbi";
};

export default function MyWorkoutsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(
    () => getWeekMondayFromOffset(weekOffset),
    [weekOffset],
  );
  const [activeTraining, setActiveTraining] = useState(0);

  const { workouts, loading } = useClientWorkouts(user?.uid, weekStart);

  const sessionsPerWeek = workouts[0]?.sessionsPerWeek ?? workouts.length ?? 0;

  const currentWorkout = workouts.find(
    (w) => w.trainingNumber === activeTraining + 1,
  );
  const exerciseCount = currentWorkout?.exercises?.length ?? 0;

  return (
    <View style={styles.screen}>
      <StatusBar style={theme.statusBar} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <CaretLeft size={20} color={theme.textPrimary} />
          </Pressable>

          <Text style={styles.title}>Moji treninzi</Text>

          {/* Week selector */}
          <View style={styles.weekSelector}>
            <Pressable
              style={styles.weekArrow}
              onPress={() => {
                setWeekOffset((p) => p - 1);
                setActiveTraining(0);
              }}
            >
              <CaretLeft size={18} color={theme.accent} />
            </Pressable>
            <View style={styles.weekCenter}>
              <Text style={styles.weekLabel}>{formatWeekLabel(weekStart)}</Text>
              {weekOffset === 0 && (
                <Text style={styles.weekBadge}>OVAJ TJEDAN</Text>
              )}
            </View>
            <Pressable
              style={styles.weekArrow}
              onPress={() => {
                setWeekOffset((p) => p + 1);
                setActiveTraining(0);
              }}
            >
              <CaretRight size={18} color={theme.accent} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator
              color={theme.accent}
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : workouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Barbell
                size={40}
                weight="duotone"
                color={theme.accent}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>Nema programa za ovaj tjedan</Text>
              <Text style={styles.emptyText}>
                Trenerica još nije poslala program.{"\n"}Provjeri opet uskoro.
              </Text>
            </View>
          ) : (
            <>
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
                  </Pressable>
                ))}
              </ScrollView>

              {exerciseCount > 0 && (
                <Text style={styles.countCaption}>
                  {exerciseCount} {pluralVjezba(exerciseCount)}
                </Text>
              )}

              {/* Exercise list */}
              {!currentWorkout || currentWorkout.exercises.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    Nema vježbi za ovaj trening.
                  </Text>
                </View>
              ) : (
                <View style={styles.exerciseList}>
                  {currentWorkout.exercises.map((ex, idx) => {
                    const video = VIDEOS.find((v) => v.id === ex.exerciseId);

                    return (
                      <ExerciseCard
                        key={idx}
                        ex={ex}
                        idx={idx}
                        video={video}
                        onNavigate={() =>
                          video && navigation.navigate("WorkoutVideo", { video })
                        }
                      />
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ExerciseCard({ ex, idx, video, onNavigate }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => video && onNavigate()}
    >
      <Animated.View style={[styles.exerciseCard, { transform: [{ scale }] }]}>
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
        {video && <CaretRight size={18} color={theme.textTertiary} />}
      </Animated.View>
    </Pressable>
  );
}
