import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    paddingVertical: 32,
    alignItems: "center",
  },
  playerWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    elevation: 8,
  },
  infoSection: {
    width: "100%",
    paddingHorizontal: 24,
    marginTop: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  category: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginVertical: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#CBD5E1",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  errorText: {
    color: "#FFF",
  },
});
