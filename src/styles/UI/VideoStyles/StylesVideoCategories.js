import { StyleSheet } from "react-native";

// Light values match the original screen exactly; dark aligns to the theme.
export const makeStyles = (isDark, t) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? t.bg : "#FBF5F7",
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 12,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: isDark ? t.textPrimary : "#2B1F26",
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? t.textSecondary : "#8B7580",
      marginTop: 4,
      fontWeight: "500",
    },

    // Grid fills the space below the header so the four tiles fill the screen.
    grid: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 20,
      gap: 14,
    },
    gridRow: {
      flex: 1,
      flexDirection: "row",
      gap: 14,
    },
    cardSpacer: {
      flex: 1,
    },
  });
