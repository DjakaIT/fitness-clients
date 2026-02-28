import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 140,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  icon: {
    width: 56,
    height: 56,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  accent: {
    marginTop: 10,
    width: 28,
    height: 4,
    borderRadius: 999,
  },
});
