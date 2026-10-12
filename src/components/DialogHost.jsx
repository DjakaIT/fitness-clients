import React, { useRef, useSyncExternalStore } from "react";
import { Text, View } from "react-native";
import AppSheet from "./AppSheet";
import PressableScale from "./PressableScale";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import { makeSheetStyles } from "../styles/Components/StylesSheet";
import { closeDialog, getDialog, subscribeDialog } from "../utils/dialog";

/**
 * Renders whatever `showDialog()` asked for. Mounted once, above navigation.
 *
 * A button's action runs after the sheet has finished leaving, not while it
 * is still on screen: actions open the camera, navigate away or start another
 * sheet, and presenting one modal over another that is mid-dismissal is what
 * iOS refuses.
 */
export default function DialogHost() {
  const dialog = useSyncExternalStore(subscribeDialog, getDialog, getDialog);
  const { theme } = useTheme();
  const styles = useThemedStyles(makeSheetStyles);

  // The last dialog stays rendered while the sheet animates out.
  const lastShown = useRef(null);
  if (dialog) lastShown.current = dialog;
  const shown = dialog ?? lastShown.current;
  const pending = useRef(null);

  const choose = (button) => {
    pending.current = button?.onPress ?? null;
    closeDialog(shown?.id);
  };

  // Backdrop, swipe or Android back: whatever "cancel" means for this one.
  const dismiss = () =>
    choose(shown?.buttons.find((b) => b.style === "cancel") ?? null);

  const onExited = () => {
    const run = pending.current;
    pending.current = null;
    run?.();
  };

  if (!shown) return null;

  const buttons = shown.buttons;
  const stacked = buttons.length > 2;
  // Cancel reads as the quiet option, so it goes first in a row (left) and
  // last in a stack (nearest the thumb's resting place, but never primary).
  const ordered = stacked
    ? [
        ...buttons.filter((b) => b.style !== "cancel"),
        ...buttons.filter((b) => b.style === "cancel"),
      ]
    : [
        ...buttons.filter((b) => b.style === "cancel"),
        ...buttons.filter((b) => b.style !== "cancel"),
      ];
  const Icon = shown.icon;
  const danger = shown.tone === "danger";

  return (
    <AppSheet
      visible={!!dialog}
      onClose={dismiss}
      onExited={onExited}
      accessibilityLabel={shown.title}
    >
      {Icon && (
        <View style={[styles.iconBubble, danger && styles.iconBubbleDanger]}>
          <Icon
            size={26}
            weight="duotone"
            color={danger ? theme.danger : theme.accent}
          />
        </View>
      )}
      <Text style={styles.title} accessibilityRole="header">
        {shown.title}
      </Text>
      {!!shown.message && <Text style={styles.body}>{shown.message}</Text>}

      <View style={stacked ? styles.btnColumn : styles.btnRow}>
        {ordered.map((button, i) => {
          const isCancel = button.style === "cancel";
          const isDestructive = button.style === "destructive";
          // In a stack only the first non-cancel action is filled; the
          // others are outlined so there is one obvious choice.
          const filled = !isCancel && (!stacked || i === 0);
          const ButtonIcon = button.icon;
          return (
            <PressableScale
              key={`${button.text}-${i}`}
              containerStyle={stacked ? undefined : { flex: 1 }}
              style={[
                styles.btn,
                stacked && styles.btnFull,
                isCancel
                  ? styles.btnGhost
                  : filled
                    ? isDestructive
                      ? styles.btnDanger
                      : styles.btnPrimary
                    : styles.btnOutline,
              ]}
              onPress={() => choose(button)}
              accessibilityRole="button"
            >
              {ButtonIcon && (
                <ButtonIcon
                  size={20}
                  weight="bold"
                  color={
                    isCancel
                      ? theme.textSecondary
                      : filled
                        ? isDestructive
                          ? styles.btnDangerText.color
                          : theme.onAccent
                        : theme.accent
                  }
                />
              )}
              <Text
                style={
                  isCancel
                    ? styles.btnGhostText
                    : filled
                      ? isDestructive
                        ? styles.btnDangerText
                        : styles.btnPrimaryText
                      : styles.btnOutlineText
                }
              >
                {button.text}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </AppSheet>
  );
}
