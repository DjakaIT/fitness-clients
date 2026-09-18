import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Whether the OS "Reduce Motion" setting is on, kept live if the user flips it
 * while the app is open.
 *
 * Reduced motion does not mean no feedback — components should swap movement
 * for a short cross-fade or a static state change, keeping the information the
 * motion was carrying.
 */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduced(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => setReduced(enabled),
    );

    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, []);

  return reduced;
}
