import { StyleSheet } from "react-native";
import { colors } from "../theme";

export const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20, // space from screen edges
  },

  card: {
    flexDirection: "row",
    backgroundColor: colors.cardBg,
    borderRadius: 28,
    padding: 14,
    boxShadow: `0px 18px 30px rgba(233, 216, 245, 0.35)`,
    elevation: 10,
  },

  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
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
    fontFamily: "LatoBold",
    color: colors.title,
    letterSpacing: -0.3,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.button,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    gap: 10,
  },

  buttonText: {
    fontFamily: "LatoBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
