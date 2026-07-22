import { StyleSheet } from "react-native";

export const makeStyles = (t) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: 20,
    },

    card: {
      flexDirection: "row",
      backgroundColor: t.card,
      borderRadius: 28,
      padding: 14,
      borderWidth: 1,
      borderColor: t.borderSoft,
      ...t.cardShadow,
    },

    imageContainer: {
      width: 140,
      height: 140,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: t.cardElevated,
    },

    image: {
      width: "100%",
      height: "100%",
    },

    content: {
      flex: 1,
      paddingLeft: 16,
      justifyContent: "space-between",
    },

    title: {
      fontSize: 22,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
      letterSpacing: -0.3,
    },

    button: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: t.accent,
      paddingVertical: 12,
      paddingHorizontal: 22,
      borderRadius: 999,
      gap: 10,
    },

    buttonText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: t.onAccent,
    },
  });
