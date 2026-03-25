import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  displayName: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124, 58, 237, 0.08)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#7C3AED",
  },
});
