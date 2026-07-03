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
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#DBC1C9",
    letterSpacing: 1.3,
    marginBottom: 12,
  },

  // ── Closed / info cards ──
  closedCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  closedIcon: { fontSize: 36, marginBottom: 12 },
  closedTitle: {
    fontSize: 17,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  closedText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#DBC1C9",
    textAlign: "center",
  },
  closedDate: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#F497BA",
    marginTop: 6,
    textAlign: "center",
  },

  // ── Existing booking notice ──
  existingCard: {
    backgroundColor: "rgba(244, 151, 186, 0.12)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(244, 151, 186, 0.3)",
  },
  existingLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#F497BA",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  existingValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  existingHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#DBC1C9",
    marginTop: 4,
  },

  // ── Date chips ──
  dateList: { gap: 8, marginBottom: 32 },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  myDateBadge: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#F497BA",
  },
  fullBadge: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.3)",
  },

  // ── Time grid ──
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
  chipMine: {
    backgroundColor: "rgba(244, 151, 186, 0.15)",
    borderColor: "rgba(244, 151, 186, 0.5)",
  },
  chipTaken: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  chipTextTaken: { color: "rgba(255,255,255,0.2)" },
  takenLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.2)",
    marginTop: 2,
  },
  mineLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "#F497BA",
    marginTop: 2,
  },

  // ── Shared active state ──
  chipActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  chipTextActive: { color: "#FFFFFF" },
  chipDisabled: { opacity: 0.4 },
  chipTextDisabled: { color: "rgba(255,255,255,0.25)" },

  // ── Submit ──
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
