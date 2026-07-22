import { StyleSheet } from "react-native";
import { radius } from "../../clientTheme";

export const makeStyles = (t) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    safeArea: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },

    // ── Header ──
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    brand: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: t.accent,
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    greeting: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
    },
    name: {
      fontSize: 30,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
    },

    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: t.textSecondary,
      letterSpacing: 1.4,
      marginBottom: 12,
    },
    list: { flex: 1 },

    // ── Appointment cards ──
    appointmentCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: t.card,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 18,
      marginBottom: 12,
      ...t.cardShadow,
    },
    appointmentLeft: {},
    appointmentDate: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
    },
    appointmentTime: {
      fontSize: 26,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
      marginTop: 2,
    },

    cancelBtn: {
      backgroundColor: t.dangerSoft,
      borderRadius: 12,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: t.dangerSoft,
    },
    cancelBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: t.danger,
    },
    cannotCancelText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: t.textTertiary,
      textAlign: "right",
    },

    // ── Empty ──
    emptyState: {
      backgroundColor: t.card,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 28,
      alignItems: "center",
      marginBottom: 16,
      ...t.cardShadow,
    },
    emptyIcon: { marginBottom: 12 },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },

    // ── CTA ──
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: t.accent,
      borderRadius: 20,
      paddingVertical: 18,
      marginBottom: 24,
      ...t.accentShadow,
    },
    addButtonText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: t.onAccent,
    },
  });
