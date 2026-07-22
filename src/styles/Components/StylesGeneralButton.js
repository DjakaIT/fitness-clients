import { StyleSheet } from "react-native";

export const sizeStyles = {
  sm: { paddingVertical: 10, paddingHorizontal: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  lg: { paddingVertical: 18, paddingHorizontal: 32 },
};

export const textSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};
export const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.2)",
    elevation: 8,
    backgroundColor: "transparent",
  },
  fullWidth: {
    width: "100%",
  },
  pressable: {
    borderRadius: 14,
    overflow: "hidden",
    // No padding here!
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    width: "100%", // Ensures gradient fills the pressable width
  },
  text: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
