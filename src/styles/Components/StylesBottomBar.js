import { StyleSheet } from "react-native";

export const makeStyles = (t) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: t.card,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: t.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: t.mode === "dark" ? 0.3 : 0.08,
      shadowRadius: 12,
      elevation: 10,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      marginTop: 4,
      letterSpacing: 0.2,
    },
  });
