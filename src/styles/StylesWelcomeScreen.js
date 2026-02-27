import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 35,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoFrame: {
    width: width * 0.48,
    height: width * 0.48,
    borderRadius: 999,
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginBottom: 40,
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },

  textGroup: {
    alignItems: "center",
  },
  title: {
    fontFamily: "LatoBold",
    fontSize: 52,
    color: colors.textPrimary,
    letterSpacing: -2,
    lineHeight: 50,
  },
  titleHighlight: {
    fontFamily: "LatoBold",
    fontSize: 52,
    color: colors.btnStart,
    letterSpacing: -2,
    lineHeight: 50,
  },
  accentLine: {
    width: 50,
    height: 3,
    backgroundColor: "#FFFFFF",
    marginVertical: 25,
    borderRadius: 2,
    opacity: 0.8,
  },
  subtitle: {
    fontFamily: "LatoRegular",
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
    letterSpacing: 1,
  },

  footer: {
    paddingBottom: 40,
  },
  noFrameButton: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    borderRadius: 100,
  },
  buttonText: {
    fontFamily: "LatoBold",
    color: colors.bgDeep,
    fontSize: 16,
    letterSpacing: 2,
  },
});
