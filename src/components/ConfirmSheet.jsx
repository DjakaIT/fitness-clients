import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { CheckIcon, WarningIcon } from "phosphor-react-native";
import AppSheet from "./AppSheet";
import PressableScale from "./PressableScale";
import useReducedMotion from "../hooks/useReducedMotion";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import { makeSheetStyles } from "../styles/Components/StylesSheet";
import { SPRINGS } from "../styles/motion";

/**
 * Bottom-sheet confirmation with a built-in success / error state.
 *
 * The parent owns the async work and drives `status`:
 *   idle    → recap + Cancel/Confirm buttons
 *   saving  → spinner, buttons disabled
 *   success → animated checkmark, auto-closes
 *   error   → error message + retry
 *
 * `tone="danger"` paints the confirm action in the theme's danger colour.
 */
export default function ConfirmSheet({
  visible,
  status = "idle",
  onConfirm,
  onClose,
  title,
  subtitle,
  confirmLabel = "Potvrdi",
  cancelLabel = "Odustani",
  tone = "accent",
  successTitle = "Spremljeno",
  successSubtitle,
  errorTitle = "Nešto je pošlo po zlu",
  errorSubtitle = "Pokušaj ponovo.",
  autoCloseMs = 1400,
  children,
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeSheetStyles);
  const reducedMotion = useReducedMotion();
  const checkScale = useRef(new Animated.Value(0)).current;
  const danger = tone === "danger";

  useEffect(() => {
    if (visible) checkScale.setValue(0);
  }, [visible, checkScale]);

  // The checkmark pops and the sheet closes itself. The overshoot is
  // deliberate here: it is the one moment the interface is allowed to
  // celebrate.
  useEffect(() => {
    if (status !== "success") return undefined;
    if (reducedMotion) checkScale.setValue(1);
    else Animated.spring(checkScale, { toValue: 1, ...SPRINGS.pop }).start();
    const t = setTimeout(() => onClose?.(), autoCloseMs);
    return () => clearTimeout(t);
  }, [status, checkScale, autoCloseMs, onClose, reducedMotion]);

  const busy = status === "saving";
  const closable = status === "idle" || status === "error";
  const confirmStyle = danger ? styles.btnDanger : styles.btnPrimary;
  const confirmTextStyle = danger ? styles.btnDangerText : styles.btnPrimaryText;

  return (
    <AppSheet
      visible={visible}
      onClose={onClose}
      dismissible={closable}
      accessibilityLabel={title}
      scroll
    >
      {status === "success" ? (
        <View style={{ alignItems: "center", paddingTop: 6 }}>
          <Animated.View
            style={[
              styles.iconBubble,
              { width: 72, height: 72, borderRadius: 36 },
              { transform: [{ scale: checkScale }] },
            ]}
          >
            <CheckIcon size={34} weight="bold" color={theme.accent} />
          </Animated.View>
          <Text style={[styles.title, { textAlign: "center" }]}>
            {successTitle}
          </Text>
          {!!successSubtitle && (
            <Text style={[styles.subtitle, { textAlign: "center" }]}>
              {successSubtitle}
            </Text>
          )}
        </View>
      ) : status === "error" ? (
        <View style={{ alignItems: "center", paddingTop: 6 }}>
          <View
            style={[
              styles.iconBubble,
              styles.iconBubbleDanger,
              { width: 72, height: 72, borderRadius: 36 },
            ]}
          >
            <WarningIcon size={32} weight="bold" color={theme.danger} />
          </View>
          <Text
            style={[styles.title, { textAlign: "center" }]}
            accessibilityRole="alert"
          >
            {errorTitle}
          </Text>
          <Text style={[styles.subtitle, { textAlign: "center" }]}>
            {errorSubtitle}
          </Text>
          <View style={[styles.btnRow, { alignSelf: "stretch" }]}>
            <PressableScale
              containerStyle={{ flex: 1 }}
              style={[styles.btn, styles.btnGhost]}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.btnGhostText}>Zatvori</Text>
            </PressableScale>
            <PressableScale
              containerStyle={{ flex: 1 }}
              style={[styles.btn, confirmStyle]}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text style={confirmTextStyle}>Pokušaj ponovo</Text>
            </PressableScale>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {children != null && <View style={styles.recap}>{children}</View>}

          <View style={styles.btnRow}>
            <PressableScale
              containerStyle={{ flex: 1 }}
              style={[styles.btn, styles.btnGhost]}
              onPress={onClose}
              disabled={busy}
              accessibilityRole="button"
            >
              <Text style={styles.btnGhostText}>{cancelLabel}</Text>
            </PressableScale>
            <PressableScale
              containerStyle={{ flex: 1 }}
              style={[styles.btn, confirmStyle, busy && styles.btnBusy]}
              onPress={onConfirm}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              accessibilityState={{ disabled: busy, busy }}
            >
              {busy ? (
                <ActivityIndicator size="small" color={confirmTextStyle.color} />
              ) : (
                <Text style={confirmTextStyle}>{confirmLabel}</Text>
              )}
            </PressableScale>
          </View>
        </>
      )}
    </AppSheet>
  );
}
