import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },

  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 32 },
  brand: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#F497BA",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  greeting: { fontSize: 16, fontFamily: "Inter_400Regular", color: "#DBC1C9" },
  name: { fontSize: 30, fontFamily: "Outfit_700Bold", color: "#FFFFFF" },
  avatar: { width: 52, height: 52, borderRadius: 26, marginLeft: 12 },
  avatarPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#DBC1C9",
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  list: { flex: 1 },

  appointmentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  appointmentLeft: {},
  appointmentDate: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  appointmentTime: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    color: "#F497BA",
    marginTop: 2,
  },

  cancelBtn: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FCA5A5",
  },
  cannotCancelText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.3)",
    textAlign: "right",
  },

  emptyState: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#DBC1C9",
    textAlign: "center",
  },

  workoutsBtn: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  workoutsBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#DBC1C9",
  },

  addButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },

  logoutBtn: { alignItems: "center", paddingBottom: 8 },
  logoutText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.35)",
  },
});
