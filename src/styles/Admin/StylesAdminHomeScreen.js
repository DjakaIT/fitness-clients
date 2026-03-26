import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  greeting: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 32,
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 40,
  },
  name: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 32,
    color: "#7C3AED",
  },
  imageWrapper: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  imageBorder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "#E5E7EB",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: "#FFFFFF",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
  },
  brandText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 6,
    color: "#9CA3AF",
    marginTop: 12,
    marginBottom: 28,
  },
  description: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  buttonArrow: {
    fontSize: 20,
    color: "#FFFFFF",
  },
});
