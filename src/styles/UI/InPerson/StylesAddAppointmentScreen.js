import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },

  backBtn: { marginBottom: 24 },
  backText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#DBC1C9" },
  title: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#DBC1C9",
    marginBottom: 32,
  },

  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#DBC1C9",
    letterSpacing: 1.3,
    marginBottom: 12,
  },

  // Dates — vertical list so full names fit
  dateList: { gap: 8, marginBottom: 32 },
  dateChip: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  dateChipText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
  },

  // Times — wrap grid
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 36,
  },
  timeChip: {
    width: "22%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  timeChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
  },

  // Active state shared by both
  chipActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  chipTextActive: { color: "#FFFFFF" },

  submitBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
