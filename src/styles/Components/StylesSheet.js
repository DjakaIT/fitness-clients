import { StyleSheet } from "react-native";
import { type } from "../clientTheme";

/**
 * Typography and buttons shared by every sheet (AppSheet children): the
 * confirmation sheet, the app's dialogs, account deletion, the trainer's
 * note. One definition, so a dialog never again ships in system fonts and a
 * colour from another app.
 */
export const makeSheetStyles = (t) =>
  StyleSheet.create({
    iconBubble: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.accentSoft,
      marginBottom: 14,
    },
    iconBubbleDanger: { backgroundColor: t.dangerSoft },
    title: {
      ...type.heading,
      fontSize: 21,
      lineHeight: 26,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
    },
    subtitle: {
      ...type.callout,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      marginTop: 6,
    },
    body: {
      ...type.body,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      marginTop: 10,
    },
    error: {
      ...type.callout,
      fontFamily: "Inter_500Medium",
      color: t.danger,
      marginTop: 12,
    },
    recap: {
      marginTop: 18,
      backgroundColor: t.cardElevated,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 14,
      gap: 10,
    },
    btnRow: { flexDirection: "row", gap: 12, marginTop: 24 },
    btnColumn: { gap: 10, marginTop: 22 },
    btn: {
      flex: 1,
      minHeight: 52,
      borderRadius: 16,
      paddingHorizontal: 16,
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    btnFull: { flex: 0, alignSelf: "stretch" },
    btnPrimary: { backgroundColor: t.accent },
    btnDanger: { backgroundColor: t.danger },
    btnGhost: { backgroundColor: t.cardElevated },
    btnOutline: {
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    btnBusy: { opacity: 0.8 },
    btnPrimaryText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.onAccent,
    },
    btnGhostText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.textSecondary,
    },
    btnOutlineText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.textPrimary,
    },
    btnDangerText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.mode === "dark" ? t.onAccent : "#FFFFFF",
    },
  });
