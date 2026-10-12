import { StyleSheet, Dimensions } from "react-native";
import { AUTH } from "../authTheme";

const { width } = Dimensions.get("window");
const LOGO = Math.min(width * 0.4, 168);

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AUTH.bgTop },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  logoWrap: {
    width: LOGO + 36,
    height: LOGO + 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },
  halo: {
    position: "absolute",
    width: LOGO + 36,
    height: LOGO + 36,
    borderRadius: (LOGO + 36) / 2,
    backgroundColor: "rgba(214, 73, 126, 0.12)",
  },
  logoCard: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    backgroundColor: AUTH.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(176,137,90,0.28)",
    shadowColor: "#7A5C48",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
  logo: { width: "100%", height: "100%" },

  textBlock: { alignItems: "center" },
  greeting: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: AUTH.gold,
    marginBottom: 14,
  },
  message: {
    fontFamily: "Outfit_700Bold",
    fontSize: 25,
    lineHeight: 33,
    letterSpacing: -0.3,
    color: AUTH.ink,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: AUTH.inkSoft,
    textAlign: "center",
  },
  dots: { flexDirection: "row", gap: 8, marginTop: 26 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AUTH.accent,
  },

  bottomActions: { alignItems: "center", paddingBottom: 24 },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "#ECE0DC",
  },
  logoutText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: AUTH.ink,
  },
  deleteLink: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12 },
  deleteLinkText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: AUTH.inkSoft,
    textDecorationLine: "underline",
  },
});
