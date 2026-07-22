import React, { useRef } from "react";
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
import {
  Barbell,
  VideoCamera,
  ChatCircleText,
  CaretRight,
  TrendDown,
  TrendUp,
} from "phosphor-react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";
import useClientMeasurements from "../../hooks/useClientMeasurements";
import { formatDateShort } from "../../../backend/utils/appointmentConfig";
import { makeStyles } from "../../styles/StylesHomeScreen";
import ProfilePageComponent from "../../components/ProfilePageComponent";

function PressableScale({ onPress, style, containerStyle, children }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      style={containerStyle}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const navigate = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { measurements, loading } = useClientMeasurements(user?.uid);

  const firstName = user?.displayName?.split(" ")[0] || "Klijentice";

  // Real weight progress: newest and oldest entries that actually have a weight.
  const weightEntries = measurements.filter(
    (m) => m.weight && !Number.isNaN(parseFloat(m.weight)),
  );
  const currentEntry = weightEntries[0];
  const startEntry = weightEntries[weightEntries.length - 1];
  const current = currentEntry ? parseFloat(currentEntry.weight) : null;
  const start = startEntry ? parseFloat(startEntry.weight) : null;

  // Success toward a weight-loss goal = share of starting weight already shed.
  const pct =
    start != null && current != null && start > 0
      ? ((start - current) / start) * 100
      : null;
  const hasProgress = weightEntries.length >= 2 && pct != null;
  const lost = pct != null && pct > 0.05;
  const gained = pct != null && pct < -0.05;
  const pctText = pct != null ? `${Math.abs(pct).toFixed(1)}%` : "–";
  const pctColor = lost
    ? theme.success
    : gained
      ? theme.accent
      : theme.textPrimary;
  const pctCaption = lost
    ? "manje nego na početku"
    : gained
      ? "više nego na početku"
      : "isto kao na početku";

  return (
    <View style={styles.container}>
      <StatusBar style={theme.statusBar} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Dobrodošla,</Text>
              <Text style={styles.headerTitle}>{firstName}</Text>
            </View>
            <ProfilePageComponent />
          </View>

          {/* ── Hero: progress ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroLabel}>MOJ NAPREDAK</Text>
              {currentEntry && (
                <Text style={styles.heroDate}>
                  {formatDateShort(currentEntry.date)}
                </Text>
              )}
            </View>

            {loading ? (
              <ActivityIndicator
                color={theme.accent}
                style={{ marginVertical: 20 }}
              />
            ) : weightEntries.length === 0 ? (
              <Text style={styles.emptyNote}>
                Trenerica još nije unijela tvoja mjerenja. Čim stigne prvo
                mjerenje, ovdje pratiš svoj napredak.
              </Text>
            ) : !hasProgress ? (
              <>
                <View style={styles.heroWeightRow}>
                  <Text style={styles.heroWeight}>{current}</Text>
                  <Text style={styles.heroWeightUnit}>kg</Text>
                </View>
                <Text style={styles.heroPctCaption}>
                  Zabilježeno prvo mjerenje — napredak se prikazuje od idućeg.
                </Text>
              </>
            ) : (
              <>
                <View style={styles.heroPctRow}>
                  {lost ? (
                    <TrendDown size={30} weight="bold" color={pctColor} />
                  ) : gained ? (
                    <TrendUp size={30} weight="bold" color={pctColor} />
                  ) : null}
                  <Text style={[styles.heroPct, { color: pctColor }]}>
                    {pctText}
                  </Text>
                </View>
                <Text style={styles.heroPctCaption}>{pctCaption}</Text>

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatLabel}>Početno</Text>
                    <Text style={styles.heroStatValue}>{start} kg</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatLabel}>Trenutno</Text>
                    <Text style={styles.heroStatValue}>{current} kg</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* ── Primary CTA ── */}
          <PressableScale
            onPress={() => navigate.navigate("MyWorkouts")}
            style={styles.ctaButton}
          >
            <Barbell size={24} weight="fill" color={theme.onAccent} />
            <Text style={styles.ctaText}>Moji treninzi</Text>
            <CaretRight size={20} color={theme.onAccent} />
          </PressableScale>

          {/* ── Secondary cards ── */}
          <View style={styles.gridRow}>
            <PressableScale
              onPress={() => navigate.navigate("VideoCategories")}
              containerStyle={styles.gridItem}
              style={styles.gridCard}
            >
              <View style={styles.gridIconBubble}>
                <VideoCamera size={22} weight="fill" color={theme.accent} />
              </View>
              <Text style={styles.gridTitle}>Video zbirka</Text>
              <Text style={styles.gridCaption}>Vježbe i tehnika</Text>
            </PressableScale>

            <PressableScale
              onPress={() => navigate.navigate("Impressions")}
              containerStyle={styles.gridItem}
              style={styles.gridCard}
            >
              <View style={styles.gridIconBubble}>
                <ChatCircleText size={22} weight="fill" color={theme.accent} />
              </View>
              <Text style={styles.gridTitle}>Dojmovi</Text>
              <Text style={styles.gridCaption}>Tjedni osvrt</Text>
            </PressableScale>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
