import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useThemedStyles } from "../context/ThemeContext";
import useReducedMotion from "../hooks/useReducedMotion";
import { DURATIONS, SPRINGS, useNativeDriver } from "../styles/motion";

const SHEET_TRAVEL = 80;

/**
 * The one bottom sheet every dialog in the app is built on, so they all share
 * the same surface, fonts, motion and — the part that used to go wrong — the
 * same respect for the phone's own navigation bar. The app draws edge to
 * edge, so a sheet with a fixed bottom padding slid its buttons under the
 * Android gesture bar or three-button bar. Here the padding is the real
 * bottom inset.
 *
 * Two hosts:
 *  - default: a Modal, above everything (tab bar included). For sheets that
 *    only show text and buttons.
 *  - `inline`: an overlay inside the current screen. For sheets with text
 *    fields — the keyboard library tracks the screen's own window, which a
 *    Modal is not, so this is the variant whose inputs stay above the
 *    keyboard on Android. Render it as the screen's last child.
 */
export default function AppSheet({
  visible,
  onClose,
  dismissible = true,
  inline = false,
  scroll = false,
  onExited,
  children,
  accessibilityLabel,
}) {
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const backdrop = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SHEET_TRAVEL)).current;

  // Stays mounted until it has animated out, so it leaves the way it came.
  const [mounted, setMounted] = useState(visible);
  // Read when the exit animation ends, so it must not restart the effect.
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  const shown = useRef(false);

  useEffect(() => {
    if (visible) {
      shown.current = true;
      setMounted(true);
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
      return undefined;
    }
    // Only a sheet that was open has anything to animate out of.
    if (!shown.current) return undefined;
    shown.current = false;
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
      if (!finished) return;
      setMounted(false);
      onExitedRef.current?.();
    });
    return undefined;
  }, [visible, reducedMotion, backdrop, translateY]);

  const requestClose = () => {
    if (dismissible) onClose?.();
  };

  // A Modal handles the Android back button itself; an inline sheet has to.
  useEffect(() => {
    if (!inline || !visible) return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (dismissible) onClose?.();
      return true;
    });
    return () => sub.remove();
  }, [inline, visible, dismissible, onClose]);

  if (!mounted) return null;

  const Body = scroll ? ScrollView : View;
  const sheet = (
    <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={requestClose}
        accessibilityRole="button"
        accessibilityLabel="Zatvori"
      />
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 12) + 20 },
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.handle} />
        <Body
          {...(scroll
            ? {
                keyboardShouldPersistTaps: "handled",
                showsVerticalScrollIndicator: false,
                bounces: false,
              }
            : {})}
        >
          {children}
        </Body>
      </Animated.View>
    </Animated.View>
  );

  if (inline) {
    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={[StyleSheet.absoluteFill, styles.inlineHost]}
        pointerEvents={visible ? "auto" : "none"}
      >
        {sheet}
      </KeyboardAvoidingView>
    );
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={requestClose}
    >
      {sheet}
    </Modal>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    inlineHost: { zIndex: 100, elevation: 100 },
    backdrop: {
      flex: 1,
      backgroundColor: t.overlay,
      justifyContent: "flex-end",
    },
    sheet: {
      maxHeight: "88%",
      backgroundColor: t.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: t.borderSoft,
      paddingHorizontal: 22,
      paddingTop: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: t.mode === "dark" ? 0.4 : 0.12,
      shadowRadius: 24,
      elevation: 24,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: t.border,
      marginBottom: 18,
    },
  });
