import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 17,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
    marginBottom: 14,
  },
  timeSlider: {
    paddingRight: 8,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    borderColor: "#7C3AED",
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#374151",
  },
  chipTextActive: {
    color: "#7C3AED",
  },
  offChip: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FBCFE8",
  },
  offChipActive: {
    backgroundColor: "#FCE7F3",
    borderColor: "#EC4899",
  },
  offChipText: {
    color: "#BE185D",
  },
  offChipTextActive: {
    color: "#9D174D",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    lineHeight: 20,
  },
  weeklySummaryCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginTop: 4,
  },
  weeklySummaryTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 12,
  },
  weeklySummaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  weeklySummaryDay: {
    width: 48,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#7C3AED",
  },
  weeklySummaryText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#374151",
    lineHeight: 19,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 24,
  },
});
