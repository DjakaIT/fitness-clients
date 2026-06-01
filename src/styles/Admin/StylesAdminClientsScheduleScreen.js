import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, paddingHorizontal: 20 },
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
    marginBottom: 24,
  },
  listContent: { paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateBlock: {
    flex: 1,
    backgroundColor: "rgba(124,58,237,0.07)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 16,
  },
  dateText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#7C3AED" },
  time: { fontSize: 18, fontFamily: "Outfit_700Bold", color: "#111827" },
  empty: {
    marginTop: 40,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#9CA3AF" },
});
