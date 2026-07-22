import { StyleSheet, Dimensions } from "react-native";
import { AUTH } from "../authTheme";

const { width } = Dimensions.get("window");
const LOGO = Math.min(width * 0.44, 180);

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AUTH.bgTop },
  safeArea: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  logoCard: {
    width: LOGO,
    height: LOGO,
    borderRadius: 26,
    backgroundColor: AUTH.card,
    overflow: "hidden",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(176,137,90,0.28)",
    shadowColor: "#7A5C48",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
  logo: { width: "100%", height: "100%" },

  title: {
    fontFamily: "Outfit_700Bold",
    fontSize: 32,
    color: AUTH.ink,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: AUTH.inkSoft,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 8,
  },

  buttonWrap: { width: "100%", marginTop: 40 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 18,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ECE0DC",
    shadowColor: "#7A5C48",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  googleIcon: { width: 22, height: 22, marginRight: 12 },
  googleButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#2B1F26",
  },

  footer: { marginTop: 26, alignItems: "center" },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: AUTH.inkSoft,
    opacity: 0.8,
  },
});
