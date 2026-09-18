import React, { useCallback, useRef } from "react";
import { Animated, Pressable } from "react-native";
import useReducedMotion from "../hooks/useReducedMotion";
import { PRESS_SCALE, SPRINGS, useNativeDriver } from "../styles/motion";

/**
 * A Pressable that acknowledges the press the instant the finger lands, rather
 * than on release. Waiting for the tap to complete before showing anything is
 * what makes a touch target feel dead.
 *
 * The spring is critically damped, so the control settles without wobbling —
 * a press is not a throw, and overshoot here would read as noise. Under
 * "Reduce Motion" the scale is dropped and the press shows as a dip in
 * opacity instead, which carries the same information without movement.
 */
export default function PressableScale({
  children,
  style,
  scaleTo = PRESS_SCALE,
  disabled = false,
  onPressIn,
  onPressOut,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();

  const handlePressIn = useCallback(
    (event) => {
      if (!disabled) {
        if (reducedMotion) {
          opacity.setValue(0.6);
        } else {
          Animated.spring(scale, {
            toValue: scaleTo,
            ...SPRINGS.press,
          }).start();
        }
      }
      onPressIn?.(event);
    },
    [disabled, reducedMotion, opacity, scale, scaleTo, onPressIn],
  );

  const handlePressOut = useCallback(
    (event) => {
      if (reducedMotion) {
        opacity.setValue(1);
      } else {
        Animated.spring(scale, { toValue: 1, ...SPRINGS.press }).start();
      }
      onPressOut?.(event);
    },
    [reducedMotion, opacity, scale, onPressOut],
  );

  return (
    <Animated.View
      style={{ transform: [{ scale }], opacity }}
      needsOffscreenAlphaCompositing={useNativeDriver ? undefined : false}
    >
      <Pressable
        style={style}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityState={{ disabled }}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
