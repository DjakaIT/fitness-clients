import { StyleSheet } from "react-native";
import { radius } from "../clientTheme";

export const makeStyles = (t) =>
  StyleSheet.create({
    // ── Avatar trigger ──
    avatarButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: t.accent,
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarFallback: {
      flex: 1,
      backgroundColor: t.cardElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarFallbackText: {
      fontSize: 18,
      fontFamily: "Outfit_700Bold",
      color: t.accent,
    },

    // ── Modal ──
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: t.overlay,
    },
    backdropPressable: {
      flex: 1,
    },
    centering: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    card: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: t.card,
      borderRadius: radius.hero,
      borderWidth: 1,
      borderColor: t.border,
      paddingTop: 32,
      paddingBottom: 24,
      paddingHorizontal: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: t.mode === "dark" ? 0.5 : 0.18,
      shadowRadius: 32,
      elevation: 24,
    },
    closeBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.cardElevated,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },

    userSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    modalAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: t.accent,
      marginBottom: 16,
      overflow: "hidden",
    },
    userName: {
      fontSize: 20,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
      marginBottom: 4,
      textAlign: "center",
    },
    userEmail: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: t.textSecondary,
      textAlign: "center",
    },

    divider: {
      height: 1,
      backgroundColor: t.border,
      marginBottom: 20,
    },

    // ── Theme toggle ──
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.cardElevated,
      borderRadius: radius.chip,
      padding: 4,
      marginBottom: 12,
    },
    themeOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
    },
    themeOptionActive: {
      backgroundColor: t.card,
    },
    themeOptionText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: t.textSecondary,
    },
    themeOptionTextActive: {
      color: t.textPrimary,
    },

    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: t.dangerSoft,
      borderRadius: radius.chip,
      borderWidth: 1,
      borderColor: t.dangerSoft,
      paddingVertical: 16,
    },
    logoutText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: t.danger,
    },
  });
