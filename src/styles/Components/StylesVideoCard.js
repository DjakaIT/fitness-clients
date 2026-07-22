import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
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
    fontFamily: "Outfit_700Bold",
    color: "#3B0F2E",
    letterSpacing: -0.3,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E9A6B2",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    gap: 10,
  },

  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
