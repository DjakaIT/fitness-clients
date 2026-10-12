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
      marginBottom: 24,
    },

    // ── Week selector ──
    weekSelector: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.card,
      borderRadius: radius.chip,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 4,
      marginBottom: 16,
      ...t.cardShadow,
    },
    weekArrow: {
      width: 44,
      height: 44,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    weekCenter: { flex: 1, alignItems: "center" },
    weekLabel: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.textPrimary,
    },
    weekBadge: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 1,
      color: t.accent,
      marginTop: 2,
    },

    // ── Training tabs (segmented) ──
    tabRow: {
      gap: 8,
      marginBottom: 12,
    },
    tab: {
      paddingVertical: 11,
      paddingHorizontal: 22,
      borderRadius: 14,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
    },
    tabActive: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },
    tabText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: t.textSecondary,
    },
    tabTextActive: { color: t.onAccent },

    countCaption: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: t.textTertiary,
      marginBottom: 12,
    },

    // ── Exercise cards ──
    exerciseList: { gap: 12 },
    exerciseCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.card,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 18,
      gap: 16,
      ...t.cardShadow,
    },
    exerciseNum: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    exerciseNumText: {
      fontSize: 15,
      fontFamily: "Outfit_700Bold",
      color: t.accent,
    },
    exerciseInfo: { flex: 1 },
    exerciseName: {
      fontSize: 16,
      fontFamily: "PlusJakartaSans_600SemiBold",
      color: t.textPrimary,
      lineHeight: 22,
    },
    exerciseMeta: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      marginTop: 3,
      lineHeight: 19,
    },
    exerciseNote: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: t.textTertiary,
      marginTop: 3,
      lineHeight: 17,
    },

    // Card chrome now wraps two regions: the header row that opens the video,
    // and the weights block, which sits outside the tap target so typing a
    // number never scales the whole card.
    exerciseShell: {
      backgroundColor: t.card,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
      ...t.cardShadow,
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      gap: 16,
    },
    weights: {
      borderTopWidth: 1,
      borderTopColor: t.borderSoft,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 16,
    },
    weightsTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    lastTime: {
      flex: 1,
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: t.textTertiary,
    },
    nudgeRow: { flexDirection: "row", gap: 6 },
    nudgeBtn: {
      minWidth: 52,
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.accentSoft,
    },
    nudgeText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: t.accent,
    },
    setRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    setBox: { alignItems: "center", width: 64 },
    setLabel: {
      fontSize: 11,
      letterSpacing: 0.4,
      fontFamily: "Inter_600SemiBold",
      color: t.textTertiary,
      marginBottom: 4,
    },
    setInput: {
      width: 64,
      height: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.inputBg,
      textAlign: "center",
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: t.textPrimary,
    },
    setInputInvalid: { borderColor: t.danger },
    kgUnit: {
      alignSelf: "flex-end",
      marginBottom: 12,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
    },

    // Save bar
    saveBar: { marginTop: 18, gap: 8 },
    saveBtn: {
      height: 54,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.accent,
      ...t.accentShadow,
    },
    saveBtnDisabled: { opacity: 0.45 },
    saveBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: t.onAccent,
    },
    saveNote: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      textAlign: "center",
      color: t.textSecondary,
    },
    saveNoteError: { color: t.danger },
    saveNoteOk: { color: t.success },

    // ── Empty ──
    emptyCard: {
      backgroundColor: t.card,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 32,
      alignItems: "center",
      marginTop: 8,
      ...t.cardShadow,
    },
    emptyIcon: { marginBottom: 16 },
    emptyTitle: {
      fontSize: 17,
      fontFamily: "PlusJakartaSans_600SemiBold",
      color: t.textPrimary,
      textAlign: "center",
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
  });
