import { StyleSheet } from "react-native";
import { type, space, radius } from "../../clientTheme";

// Themed: the screen used a hard-coded slate blue (#0F172A) that belonged to
// neither palette and broke the light theme entirely.
export const makeStyles = (t) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.bg,
    },
    safeArea: { flex: 1 },
    content: {
      paddingHorizontal: space.md,
      paddingBottom: space.xl,
    },

    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: space.xs,
      paddingBottom: space.sm,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.borderSoft,
    },

    // 16:9 stage. Black under the video regardless of theme — letterboxing
    // inside a player should read as the film, not as the page.
    player: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: radius.card,
      overflow: "hidden",
      backgroundColor: "#000",
      ...t.cardShadow,
    },
    poster: {
      ...StyleSheet.absoluteFillObject,
    },
    posterPlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
    posterPlayDisc: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.45)",
    },

    header: {
      marginTop: space.lg,
    },
    category: {
      ...type.overline,
      fontFamily: "Inter_600SemiBold",
      color: t.accent,
      textTransform: "uppercase",
    },
    title: {
      ...type.title,
      fontFamily: "Outfit_700Bold",
      color: t.textPrimary,
      marginTop: 6,
    },

    // Tips: quiet by design. Hairline card, small label, body text — present
    // for whoever wants it, never competing with the video above.
    tipsLabel: {
      ...type.overline,
      fontFamily: "Inter_600SemiBold",
      color: t.textTertiary,
      textTransform: "uppercase",
      marginTop: space.lg,
      marginBottom: space.sm,
    },
    tipsCard: {
      backgroundColor: t.card,
      borderRadius: radius.chip,
      borderWidth: 1,
      borderColor: t.borderSoft,
      paddingVertical: 4,
      paddingHorizontal: space.md,
    },
    tipRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: space.sm,
      gap: space.sm,
    },
    tipDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.border,
      marginLeft: 30,
    },
    tipIcon: {
      width: 18,
      marginTop: 2,
      alignItems: "center",
    },
    tipBody: { flex: 1 },
    tipKind: {
      ...type.caption,
      fontFamily: "Inter_600SemiBold",
      color: t.textSecondary,
      marginBottom: 2,
    },
    tipText: {
      ...type.callout,
      fontFamily: "Inter_400Regular",
      color: t.textPrimary,
    },

    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: t.bg,
    },
    errorText: {
      ...type.body,
      fontFamily: "Inter_500Medium",
      color: t.textSecondary,
    },
  });
