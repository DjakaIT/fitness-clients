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

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  // Title
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
  subtitleHighlight: {
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 12,
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
  statCardLight: {
    backgroundColor: "#fdf2f6",
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
  statNumberLight: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    marginBottom: 2,
  },
  statLabelLight: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
    letterSpacing: 0.8,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 4,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
});
