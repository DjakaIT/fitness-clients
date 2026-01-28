import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>Logo</Text>
        </View>
      </View>
      <View style={styles.copyWrap}>
        <Text style={styles.title}>Marta Fitness</Text>
        <Text style={styles.subtitle}>Your curated exercise library, anytime.</Text>
      </View>
    </SafeAreaView>
  );
}

const BG = "#f7f8fa";          // soft whitesmoke
const ACCENT = "#f5ccd8";      // rose blush
const ACCENT_DARK = "#e89fb8"; // deeper rose

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center", padding: 24, gap: 32, width: "100%" },
  logoWrap: { alignItems: "center", justifyContent: "center" },
  logoPlaceholder: {
    width: 164,
    height: 164,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: ACCENT,
    shadowColor: ACCENT_DARK,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: ACCENT_DARK, fontWeight: "700", letterSpacing: 1 },
  copyWrap: { alignItems: "center", gap: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#1f1f1f" },
  subtitle: { fontSize: 16, color: "#555", textAlign: "center", maxWidth: 320 },
});