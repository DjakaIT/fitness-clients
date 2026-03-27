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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  title: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 20,
  },
  subtitleHighlight: {
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },

  statsRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statCardPrimary: {
    backgroundColor: "#7C3AED",
  },
  statNumberPrimary: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  statLabelPrimary: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.8,
  },

  reviewCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 16,
  },

  ratingsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
  },
  ratingLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    flex: 1,
  },
  starsRow: {
    flexDirection: "row",
    gap: 3,
  },
  ratingNumber: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#8B5CF6",
    minWidth: 28,
    textAlign: "right",
  },

  reflectionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reflectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 22,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
  },

  listContent: {
    paddingBottom: 32,
  },
});
