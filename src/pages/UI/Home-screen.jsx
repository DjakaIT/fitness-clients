import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import GeneralButton from "../../components/GeneralButton";

const { width } = Dimensions.get("window");

const colors = {
  bgDeep: "#4b0622",
  bgSoft: "#654b55",
  textPrimary: "#FFFFFF",
  textSecondary: "#DBC1C9",
  accentPink: "#F497BA",
  cardBg: "rgba(255, 255, 255, 0.1)",
  cardBorder: "rgba(255, 255, 255, 0.2)",
  success: "#34D399",
};

const userData = {
  name: "Marta",
  currentWeight: 68.5,
  startWeight: 75.0,
  goalWeight: 62.0,
  progressPercent: 0.65,
};

export default function HomeScreen() {
  const navigate = useNavigation();

  const lostSoFar = (userData.startWeight - userData.currentWeight).toFixed(1);
  const percentDisplay = Math.round(userData.progressPercent * 100);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.bgSoft, colors.bgDeep]}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* --- HEADER --- */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Dobrodošla,</Text>
                <Text style={styles.headerTitle}>{userData.name}</Text>
              </View>
              <View style={styles.profileImageContainer}>
                {/* Replace with actual user image later */}
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=5" }}
                  style={styles.profileImage}
                />
                <View style={styles.notificationDot} />
              </View>
            </View>

            {/* --- GOAL / PROGRESS CARD --- */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Moj Napredak</Text>
                <Text style={styles.percentText}>{percentDisplay}%</Text>
              </View>

              {/* Custom Progress Bar */}
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={[colors.accentPink, "#F2829E"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressBarFill,
                    { width: `${percentDisplay}%` },
                  ]}
                />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Trenutno</Text>
                  <Text style={styles.statValue}>
                    {userData.currentWeight} <Text style={styles.unit}>kg</Text>
                  </Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Izgubljeno</Text>
                  <Text
                    style={[styles.statValue, { color: colors.accentPink }]}
                  >
                    -{lostSoFar}{" "}
                    <Text style={[styles.unit, { color: colors.accentPink }]}>
                      kg
                    </Text>
                  </Text>
                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Cilj</Text>
                  <Text style={styles.statValue}>
                    {userData.goalWeight} <Text style={styles.unit}>kg</Text>
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Brzi Pristup</Text>

            <View style={styles.buttonStack}>
              <GeneralButton
                onPress={() => navigate.navigate("VideoCategories")}
                colors={["#8b5cf6", "#7c3aed"]} // Purple variation
                fullWidth
                style={styles.actionButton}
              >
                Video zbirka
              </GeneralButton>
              <GeneralButton
                onPress={() => navigate.navigate("Impressions")}
                colors={["#8b5cf6", "#7c3aed"]} // Purple variation
                fullWidth
                style={styles.actionButton}
              >
                Dojmovi
              </GeneralButton>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontFamily: "LatoRegular", // Ensure these fonts are loaded in App.js
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontFamily: "LatoBold",
    fontSize: 28,
    color: colors.textPrimary,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.accentPink,
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bgDeep,
  },

  // Glass Card
  glassCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "LatoBold",
    color: colors.textPrimary,
  },
  percentText: {
    fontSize: 24,
    fontFamily: "LatoBold",
    color: colors.accentPink,
  },

  // Progress Bar
  progressBarBg: {
    height: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 5,
    marginBottom: 25,
    overflow: "hidden", // Ensures the inner fill doesn't bleed out
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },

  // Stats Grid
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: "LatoRegular",
  },
  statValue: {
    fontSize: 20,
    color: colors.textPrimary,
    fontFamily: "LatoBold",
  },
  unit: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "normal",
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.cardBorder,
  },

  // Buttons
  sectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
    fontFamily: "LatoBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  buttonStack: {
    gap: 15, // Adds space between buttons
  },
  actionButton: {
    marginBottom: 15,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#FFF",
    fontFamily: "LatoBold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
