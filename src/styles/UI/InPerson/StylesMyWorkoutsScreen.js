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
    marginBottom: 20,
  },

  // ── Week selector ──
  weekSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  weekArrow: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  weekArrowText: {
    fontSize: 24,
    color: "#F497BA",
    lineHeight: 28,
  },
  weekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },

  // ── Empty ──
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emptyIcon: { fontSize: 42, marginBottom: 12 },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#DBC1C9",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Tabs ──
  tabRow: { gap: 8, marginBottom: 20 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tabActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
  },
  tabTextActive: { color: "#FFFFFF" },

  // ── Exercises ──
  exerciseList: { gap: 10 },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 14,
  },
  exerciseNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(244,151,186,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  exerciseNumText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#F497BA",
  },
  exerciseInfo: { flex: 1 },
  exerciseName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    lineHeight: 22,
  },
  exerciseMeta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#DBC1C9",
    marginTop: 4,
    lineHeight: 19,
  },
});
