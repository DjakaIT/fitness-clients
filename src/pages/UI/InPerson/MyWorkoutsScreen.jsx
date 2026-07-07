import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import useClientWorkouts from "../../../hooks/useClientWorkouts";
import {
  getWeekMondayFromOffset,
  formatWeekLabel,
} from "../../../../backend/utils/appointmentConfig";
import { styles } from "../../../styles/UI/InPerson/StylesMyWorkoutsScreen";
import { VIDEOS } from "../../../../backend/data/videos";

const toTitleCase = (str) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function MyWorkoutsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

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
              <Text style={styles.weekArrowText}>‹</Text>
            </Pressable>
            <Text style={styles.weekLabel}>{formatWeekLabel(weekStart)}</Text>
            <Pressable
              style={styles.weekArrow}
              onPress={() => {
                setWeekOffset((p) => p + 1);
                setActiveTraining(0);
              }}
            >
              <Text style={styles.weekArrowText}>›</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator
              color="#F497BA"
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : workouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyTitle}>
                Nema programa za ovaj tjedan
              </Text>
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
                    style={[
                      styles.tab,
                      activeTraining === i && styles.tabActive,
                    ]}
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
                          video &&
                          navigation.navigate("WorkoutVideo", { video })
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
    </LinearGradient>
  );
}

function ExerciseCard({ ex, idx, video, onNavigate }) {
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
            {ex.note ? `\n${ex.note}` : ""}
          </Text>
        </View>
        {video && (
          <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>
            ›
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}
