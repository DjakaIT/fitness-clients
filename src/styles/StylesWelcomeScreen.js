import { StyleSheet, Dimensions } from "react-native";
import { AUTH } from "./authTheme";

const { width } = Dimensions.get("window");
const CARD = Math.min(width * 0.72, 300);

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AUTH.bgTop },
  safeArea: { flex: 1, paddingHorizontal: 32 },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoCard: {
    width: CARD,
    height: CARD,
    borderRadius: 30,
    backgroundColor: AUTH.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(176,137,90,0.28)",
    shadowColor: "#7A5C48",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
  },
  logo: { width: "100%", height: "100%" },

  divider: {
    width: 46,
    height: 2,
    backgroundColor: AUTH.gold,
    borderRadius: 2,
    marginTop: 34,
    marginBottom: 18,
    opacity: 0.85,
  },
  tagline: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: AUTH.inkSoft,
    textAlign: "center",
  },

  footer: { paddingBottom: 40 },
  button: {
    borderRadius: 100,
    backgroundColor: AUTH.accent,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: AUTH.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    color: AUTH.onAccent,
    fontSize: 15,
    letterSpacing: 3,
  },
});
