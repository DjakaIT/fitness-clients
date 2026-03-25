import { StyleSheet } from "react-native";
import { colors } from "./theme";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontFamily: "LatoRegular",
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontFamily: "LatoBold",
    fontSize: 28,
    color: colors.textPrimary,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.accentPink,
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bgDeep,
  },

  glassCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "LatoBold",
    color: colors.textPrimary,
    flexShrink: 1,
    paddingRight: 12,
  },
  percentText: {
    fontSize: 24,
    fontFamily: "LatoBold",
    color: colors.accentPink,
    minWidth: 56,
    textAlign: "right",
  },

  // Progress Bar
  progressBarBg: {
    height: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 5,
    marginBottom: 25,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },

  // Stats Grid
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: "LatoRegular",
  },
  statValue: {
    fontSize: 20,
    color: colors.textPrimary,
    fontFamily: "LatoBold",
  },
  unit: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "normal",
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.cardBorder,
  },

  buttonStack: {
    gap: 15,
  },
  actionButton: {
    marginBottom: 15,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#FFF",
    fontFamily: "LatoBold",
    fontSize: 14,
    letterSpacing: 1,
  },

  // Modal
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  backdropPressable: {
    flex: 1,
  },
  modalCentering: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  modalGradient: {
    paddingTop: 32,
    paddingBottom: 8,
    paddingHorizontal: 24,
    position: "relative",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalUserSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.accentPink,
    marginBottom: 14,
  },
  modalUserName: {
    fontSize: 20,
    fontFamily: "LatoBold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 13,
    fontFamily: "LatoRegular",
    color: colors.textSecondary,
    opacity: 0.8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  modalActions: {
    gap: 10,
    marginBottom: 20,
  },
  modalBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  modalBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  modalBtnText: {
    fontSize: 15,
    fontFamily: "LatoBold",
    color: colors.textPrimary,
    marginLeft: 14,
    flex: 1,
  },
  modalBtnChevron: {
    marginLeft: "auto",
  },
  modalAccentLine: {
    height: 3,
    borderRadius: 2,
    marginHorizontal: 40,
    marginBottom: 16,
  },
});
