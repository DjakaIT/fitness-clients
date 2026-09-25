import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * Stack transitions.
 *
 * `ios_from_right` is the iOS push on Android: the new screen slides in from
 * the right while the one underneath shifts left and dims — the parallax that
 * makes a push read as depth rather than a slideshow. iOS resolves it to its
 * own native push, so both platforms feel the same.
 *
 * The previous `fade_from_bottom` entered from below while the back gesture
 * dismissed sideways, so a screen left along a different path from the one it
 * arrived on. Entry and exit are now the same axis.
 *
 * `contentStyle` matters as much as the animation: without it the container
 * behind each screen is white, and a dark-theme push flashes white mid-slide.
 */
const baseStack = {
  headerShown: false,
  gestureEnabled: true,
  // iOS: swipe back from anywhere on the screen, not only the 20pt edge.
  fullScreenGestureEnabled: true,
  animationMatchesGesture: true,
};

export const STACK_ANIMATION = "ios_from_right";
export const REDUCED_STACK_ANIMATION = "fade";

/** Screen options for a client-facing stack, following the active theme. */
export function useStackScreenOptions() {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();

  return useMemo(
    () => ({
      ...baseStack,
      // Under Reduce Motion the push becomes a cross-fade: no travel, same
      // information that the screen changed.
      animation: reducedMotion ? REDUCED_STACK_ANIMATION : STACK_ANIMATION,
      contentStyle: { backgroundColor: theme.bg },
    }),
    [reducedMotion, theme.bg],
  );
}

/** The admin shell has its own fixed light palette rather than the client theme. */
export const ADMIN_BG = "#F7F7F8";

export function useAdminStackScreenOptions() {
  const reducedMotion = useReducedMotion();
  return useMemo(
    () => ({
      ...baseStack,
      animation: reducedMotion ? REDUCED_STACK_ANIMATION : STACK_ANIMATION,
      contentStyle: { backgroundColor: ADMIN_BG },
    }),
    [reducedMotion],
  );
}

/** Kept for any caller that wants static options (tests, one-off screens). */
export const sharedScreenOptions = {
  ...baseStack,
  animation: STACK_ANIMATION,
};
