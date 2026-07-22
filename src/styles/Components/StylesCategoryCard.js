import { StyleSheet } from "react-native";
import { radius } from "../clientTheme";

// Flex-based so cards fill their grid cell — the 2×2 grid expands to fill the
// screen height instead of clustering small at the top.
export const makeStyles = (t) =>
  StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
      padding: 10,
      ...t.cardShadow,
    },
    imageWrap: {
      flex: 1,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: t.cardElevated,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    labelWrap: {
      paddingTop: 12,
      paddingHorizontal: 4,
    },
    name: {
      fontSize: 15,
      fontFamily: "PlusJakartaSans_600SemiBold",
      color: t.textPrimary,
    },
    caption: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: t.accent,
      marginTop: 2,
    },
    fallbackImage: {
      flex: 1,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.accentSoft,
    },
    fallbackGlyph: {
      fontSize: 26,
      fontFamily: "Outfit_700Bold",
      color: t.accent,
    },
  });
