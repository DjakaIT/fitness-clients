import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 6,
    shadowColor: "#1F2937",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  displayName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
    fontWeight: "500",
  },
  buttonPressable: {
    flexShrink: 0,
    borderRadius: 12,
    overflow: "hidden",
    maxWidth: "42%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
