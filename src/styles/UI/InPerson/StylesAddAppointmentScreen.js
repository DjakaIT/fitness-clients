import { StyleSheet } from "react-native";
import { radius } from "../../clientTheme";

export const makeStyles = (t) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    safeArea: { flex: 1 },
    container: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },

    // ── Header ──
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 30,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      marginBottom: 24,
    },

    label: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: t.textSecondary,
      letterSpacing: 1.4,
      marginBottom: 12,
    },

    // ── Closed / info cards ──
    closedCard: {
      backgroundColor: t.card,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 28,
      alignItems: "center",
      marginTop: 16,
      ...t.cardShadow,
    },
    closedIcon: { fontSize: 36, marginBottom: 12 },
    closedTitle: {
      fontSize: 17,
      fontFamily: "PlusJakartaSans_600SemiBold",
      color: t.textPrimary,
      textAlign: "center",
      marginBottom: 8,
    },
    closedText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      textAlign: "center",
    },
    closedDate: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: t.accent,
      marginTop: 6,
      textAlign: "center",
    },

    // ── Slots preview ──
    slotsBox: {
      backgroundColor: t.card,
      borderRadius: radius.chip,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 12,
      marginBottom: 8,
      gap: 8,
      ...t.cardShadow,
    },
    slotsEmpty: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: t.textTertiary,
      textAlign: "center",
      paddingVertical: 10,
    },
    slotRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.cardElevated,
      borderRadius: 14,
      padding: 14,
      gap: 10,
    },
    slotInfo: { flex: 1 },
    slotDate: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
    },
    slotTime: {
      fontSize: 22,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
      marginTop: 1,
    },
    slotRemoveBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: t.dangerSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    slotRemoveText: {
      fontSize: 12,
      color: t.danger,
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
      color: t.textTertiary,
    },
    counterHint: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: t.accent,
    },

    // ── Date chips ──
    dateList: { gap: 10, marginBottom: 24 },
    dateChip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: radius.chip,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
    },
    dateChipText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
    },
    chipAdded: {
      backgroundColor: t.successSoft,
      borderColor: t.successSoft,
    },
    chipTextAdded: { color: t.success },
    addedBadge: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: t.success,
    },
    fullBadge: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: t.textTertiary,
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
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: "center",
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
    },
    timeChipText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
    },
    chipTaken: {
      backgroundColor: t.cardElevated,
      borderColor: t.borderSoft,
    },
    chipTextTaken: { color: t.textTertiary },

    // ── Shared active / disabled ──
    chipActive: { backgroundColor: t.accent, borderColor: t.accent },
    chipTextActive: { color: t.onAccent, fontFamily: "Inter_600SemiBold" },
    chipDisabled: { opacity: 0.4 },
    chipTextDisabled: { color: t.textTertiary },

    // ── Add slot button ──
    addSlotBtn: {
      backgroundColor: t.accentSoft,
      borderRadius: radius.chip,
      paddingVertical: 15,
      alignItems: "center",
      borderWidth: 1,
      borderColor: t.accentBorder,
      marginBottom: 4,
    },
    addSlotBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.accent,
    },

    // ── Submit ──
    submitBtn: {
      backgroundColor: t.accent,
      borderRadius: 20,
      paddingVertical: 18,
      alignItems: "center",
      ...t.accentShadow,
    },
    submitBtnDisabled: { opacity: 0.4, shadowOpacity: 0, elevation: 0 },
    submitBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: t.onAccent,
    },
  });
