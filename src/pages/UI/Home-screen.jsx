import React from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import GeneralButton from "../../components/GeneralButton";
import { useAuth } from "../../context/AuthContext";
import { styles } from "../../styles/StylesHomeScreen";
import ProfilePageComponent from "../../components/ProfilePageComponent";

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
  name: "Klijentica",
  currentWeight: 68.5,
  startWeight: 75.0,
  goalWeight: 62.0,
  progressPercent: 0.65,
};

export default function HomeScreen() {
  const navigate = useNavigation();
  const { user } = useAuth();

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
                <Text style={styles.headerTitle}>
                  {user?.displayName?.split(" ")[0] || userData.name}
                </Text>
              </View>

              <ProfilePageComponent />
            </View>

            {/* --- GOAL / PROGRESS CARD --- */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Moj napredak</Text>
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

      {/* --- PROFILE MODAL --- */}
    </View>
  );
}
