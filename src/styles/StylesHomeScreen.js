import { StyleSheet } from "react-native";
import { radius } from "./clientTheme";

export const makeStyles = (t) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    safeArea: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },

    // ── Header ──
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      marginBottom: 32,
    },
    greeting: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      color: t.textSecondary,
      marginBottom: 2,
    },
    headerTitle: {
      fontFamily: "Outfit_700Bold",
      fontSize: 30,
      color: t.textPrimary,
    },

    // ── Hero (progress) card ──
    heroCard: {
      backgroundColor: t.card,
      borderRadius: radius.hero,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 24,
      marginBottom: 24,
      ...t.cardShadow,
    },
    heroHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    heroLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 1.4,
      color: t.textSecondary,
    },
    heroDate: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: t.textTertiary,
    },
    heroWeightRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 24,
    },
    heroWeight: {
      fontSize: 48,
      lineHeight: 52,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
    },
    heroWeightUnit: {
      fontSize: 18,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
      marginLeft: 6,
      marginBottom: 6,
    },
    // ── Progress percentage (success toward weight-loss) ──
    heroPctRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    heroPct: {
      fontSize: 46,
      lineHeight: 50,
      fontFamily: "Outfit_700Bold",
    },
    heroPctCaption: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
    },

    heroStatsRow: {
      flexDirection: "row",
      backgroundColor: t.cardElevated,
      borderRadius: radius.chip,
      paddingVertical: 14,
      marginTop: 22,
    },
    heroStat: {
      flex: 1,
      alignItems: "center",
    },
    heroStatDivider: {
      width: 1,
      backgroundColor: t.border,
      marginVertical: 4,
    },
    heroStatLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      marginBottom: 4,
    },
    heroStatValue: {
      fontSize: 17,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
    },
    emptyNote: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      lineHeight: 21,
    },

    // ── Primary CTA ──
    ctaButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.accent,
      borderRadius: 20,
      paddingVertical: 18,
      paddingHorizontal: 22,
      marginBottom: 16,
      ...t.accentShadow,
    },
    ctaText: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: t.onAccent,
      marginLeft: 14,
    },

    // ── Secondary cards grid ──
    gridRow: {
      flexDirection: "row",
      gap: 16,
    },
    gridItem: {
      flex: 1,
    },
    gridCard: {
      flex: 1,
      backgroundColor: t.card,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 20,
      ...t.cardShadow,
    },
    gridIconBubble: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.accentSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    gridTitle: {
      fontSize: 15,
      fontFamily: "PlusJakartaSans_600SemiBold",
      color: t.textPrimary,
      marginBottom: 2,
    },
    gridCaption: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
    },
  });
