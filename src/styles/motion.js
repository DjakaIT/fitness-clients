import { Platform } from "react-native";

/**
 * Motion tokens.
 *
 * Apple specifies a spring with two designer-facing numbers rather than the
 * physics triplet: a **damping ratio** (1.0 = critically damped, no overshoot;
 * below 1.0 bounces) and a **response** (roughly how long it takes to reach the
 * target, in seconds). React Native's Animated.spring wants stiffness / damping
 * / mass, so `spring()` converts:
 *
 *   stiffness = (2π / response)² · mass
 *   damping   = 4π · ratio · mass / response
 *
 * Every animation in the app should come from this file, so no screen invents
 * its own timing and the whole product settles at the same rate.
 */

export const useNativeDriver = Platform.OS !== "web";

export function spring(response, dampingRatio = 1, mass = 1) {
  const omega = (2 * Math.PI) / response;
  return {
    stiffness: Math.round(omega * omega * mass),
    damping: Math.round(2 * dampingRatio * omega * mass * 100) / 100,
    mass,
    useNativeDriver,
  };
}

export const SPRINGS = {
  /** Default for anything a finger did not throw: graceful, never bouncy. */
  standard: spring(0.35, 1),
  /** Press-down / press-up feedback: fast enough to feel instant. */
  press: spring(0.22, 1),
  /** A sheet arriving. Apple ships a little bounce on drawers. */
  sheet: spring(0.3, 0.8),
  /** A confirmation mark landing — the one place overshoot earns its keep. */
  pop: spring(0.35, 0.62),
};

export const DURATIONS = {
  /** Instant press feedback — anything longer reads as lag. */
  instant: 100,
  backdrop: 200,
  /** Cross-fade used in place of movement under reduced motion. */
  reducedMotion: 180,
};

/** Scale a control settles to while held down. */
export const PRESS_SCALE = 0.97;
