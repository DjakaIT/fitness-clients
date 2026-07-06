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

  // ── Slots preview ──
  slotsBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  slotsEmpty: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    paddingVertical: 8,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  slotInfo: { flex: 1 },
  slotDate: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#DBC1C9",
  },
  slotTime: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    color: "#F497BA",
    marginTop: 1,
  },
  slotRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  slotRemoveText: {
    fontSize: 12,
    color: "#FCA5A5",
    fontFamily: "Inter_600SemiBold",
  },

  // ── Counter ──
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  counterText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.35)",
  },
  counterHint: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#F497BA",
  },

  // ── Date chips ──
  dateList: { gap: 8, marginBottom: 20 },
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
  chipAdded: {
    backgroundColor: "rgba(52, 211, 153, 0.1)",
    borderColor: "rgba(52, 211, 153, 0.35)",
  },
  chipTextAdded: { color: "#34D399" },
  addedBadge: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#34D399",
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
    marginBottom: 16,
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
  chipTaken: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  chipTextTaken: { color: "rgba(255,255,255,0.2)" },

  // ── Shared active / disabled ──
  chipActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  chipTextActive: { color: "#FFFFFF" },
  chipDisabled: { opacity: 0.35 },
  chipTextDisabled: { color: "rgba(255,255,255,0.25)" },

  // ── Add slot button ──
  addSlotBtn: {
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.4)",
    marginBottom: 4,
  },
  addSlotBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#C4B5FD",
  },

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
