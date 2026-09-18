import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import useReducedMotion from "../hooks/useReducedMotion";
import { DURATIONS, SPRINGS, useNativeDriver } from "../styles/motion";

const SHEET_TRAVEL = 60;

/**
 * Reusable bottom-sheet confirmation dialog with a built-in success / error
 * feedback state. Replaces jarring native Alert.alert confirmations.
 *
 * The parent owns the async work and drives `status`:
 *   idle    → recap + Cancel/Confirm buttons
 *   saving  → spinner, buttons disabled
 *   success → animated checkmark, auto-closes
 *   error   → error message + retry
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
  accent = "#7C3AED",
  successTitle = "Spremljeno",
  successSubtitle,
  errorTitle = "Nešto je pošlo po zlu",
  errorSubtitle = "Pokušaj ponovo.",
  autoCloseMs = 1400,
  children,
}) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SHEET_TRAVEL)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  // The sheet has to outlive `visible` long enough to animate out. Without
  // this it vanished on a hard cut, so the way it left never matched the way
  // it arrived.
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      checkScale.setValue(0);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: DURATIONS.backdrop,
          useNativeDriver,
        }),
        reducedMotion
          ? Animated.timing(translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver,
            })
          : Animated.spring(translateY, { toValue: 0, ...SPRINGS.sheet }),
      ]).start();
      return;
    }

    if (!mounted) return;

    // Leaves along the path it arrived on.
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: DURATIONS.backdrop,
        useNativeDriver,
      }),
      Animated.timing(translateY, {
        toValue: reducedMotion ? 0 : SHEET_TRAVEL,
        duration: DURATIONS.backdrop,
        useNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
    // `mounted` is read but must not re-trigger the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reducedMotion, backdrop, translateY, checkScale]);

  // Pop the checkmark and auto-close on success. The overshoot is deliberate
  // here: it is the one moment the interface is allowed to celebrate.
  useEffect(() => {
    if (status !== "success") return;
    if (reducedMotion) checkScale.setValue(1);
    else Animated.spring(checkScale, { toValue: 1, ...SPRINGS.pop }).start();
    const t = setTimeout(() => onClose?.(), autoCloseMs);
    return () => clearTimeout(t);
  }, [status, checkScale, autoCloseMs, onClose, reducedMotion]);

  const busy = status === "saving";
  const closable = status === "idle" || status === "error";

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => closable && onClose?.()}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          onPress={() => closable && onClose?.()}
        />
        <Animated.View
          accessibilityViewIsModal
          accessibilityRole={status === "error" ? "alert" : undefined}
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />

          {status === "success" ? (
            <View style={styles.stateBlock}>
              <Animated.View
                style={[
                  styles.iconBubble,
                  {
                    backgroundColor: `${accent}14`,
                    transform: [{ scale: checkScale }],
                  },
                ]}
              >
                <Text style={[styles.iconGlyph, { color: accent }]}>✓</Text>
              </Animated.View>
              <Text style={styles.stateTitle}>{successTitle}</Text>
              {!!successSubtitle && (
                <Text style={styles.stateSubtitle}>{successSubtitle}</Text>
              )}
            </View>
          ) : status === "error" ? (
            <View style={styles.stateBlock}>
              <View style={[styles.iconBubble, styles.iconBubbleError]}>
                <Text style={styles.iconGlyphError}>!</Text>
              </View>
              <Text style={styles.stateTitle}>{errorTitle}</Text>
              <Text style={styles.stateSubtitle}>{errorSubtitle}</Text>
              <View style={styles.btnRow}>
                <Pressable
                  accessibilityRole="button"
                  style={[styles.btn, styles.btnGhost]}
                  onPress={onClose}
                >
                  <Text style={styles.btnGhostText}>Zatvori</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={[styles.btn, { backgroundColor: accent }]}
                  onPress={onConfirm}
                >
                  <Text style={styles.btnPrimaryText}>Pokušaj ponovo</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.title}>{title}</Text>
              {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

              {children != null && <View style={styles.recap}>{children}</View>}

              <View style={styles.btnRow}>
                <Pressable
                  accessibilityRole="button"
                  style={[styles.btn, styles.btnGhost]}
                  onPress={onClose}
                  disabled={busy}
                >
                  <Text style={styles.btnGhostText}>{cancelLabel}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: busy, busy }}
                  accessibilityLabel={confirmLabel}
                  style={[
                    styles.btn,
                    { backgroundColor: accent },
                    busy && styles.btnBusy,
                  ]}
                  onPress={onConfirm}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 20,
  },
  recap: {
    marginTop: 18,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 14,
    gap: 10,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: {
    backgroundColor: "#F3F4F6",
  },
  btnGhostText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },
  btnPrimaryText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  btnBusy: {
    opacity: 0.85,
  },
  stateBlock: {
    alignItems: "center",
    paddingTop: 6,
  },
  iconBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconBubbleError: {
    backgroundColor: "#FEF2F2",
  },
  iconGlyph: {
    fontSize: 36,
    fontFamily: "Outfit_700Bold",
    lineHeight: 40,
  },
  iconGlyphError: {
    fontSize: 34,
    fontFamily: "Outfit_700Bold",
    color: "#EF4444",
    lineHeight: 38,
  },
  stateTitle: {
    fontSize: 19,
    fontFamily: "Outfit_700Bold",
    color: "#111827",
    textAlign: "center",
  },
  stateSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});
