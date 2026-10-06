import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";

const TITLE = "Odbaciti promjene?";
const DEFAULT_MESSAGE =
  "Ono što si upisala, a nisi spremila, bit će izgubljeno.";

/**
 * Runs `onDiscard` straight away when nothing is unsaved, and otherwise only
 * after asking. For in-screen moves that throw edits away — switching the
 * week or the date a form is about.
 */
export function confirmDiscard(dirty, onDiscard, message = DEFAULT_MESSAGE) {
  if (!dirty) {
    onDiscard();
    return;
  }
  Alert.alert(TITLE, message, [
    { text: "Ostani", style: "cancel" },
    { text: "Odbaci", style: "destructive", onPress: onDiscard },
  ]);
}

/**
 * Asks before leaving a screen with unsaved input — back button, swipe-back
 * and Android's hardware back alike (they all remove the screen). Leaving on
 * purpose after a save goes through `allowLeave()` first, so a just-saved
 * form does not ask.
 */
export default function useConfirmDiscard(
  navigation,
  dirty,
  message = DEFAULT_MESSAGE,
) {
  const leaving = useRef(false);

  useEffect(() => {
    if (!navigation?.addListener) return undefined;
    return navigation.addListener("beforeRemove", (event) => {
      if (!dirty || leaving.current) return;
      event.preventDefault();
      Alert.alert(TITLE, message, [
        { text: "Ostani", style: "cancel" },
        {
          text: "Odbaci",
          style: "destructive",
          onPress: () => navigation.dispatch(event.data.action),
        },
      ]);
    });
  }, [navigation, dirty, message]);

  const allowLeave = useCallback(() => {
    leaving.current = true;
  }, []);

  return { allowLeave };
}
