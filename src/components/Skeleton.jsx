import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useTheme } from "../context/ThemeContext";
import useReducedMotion from "../hooks/useReducedMotion";
import { useNativeDriver } from "../styles/motion";

/**
 * A placeholder in the shape of the content that is on its way.
 *
 * A spinner says "wait"; a skeleton says "this is what is coming", so the
 * layout does not jump when the data lands. The pulse is ~1.2 s — quick enough
 * to read as activity, well clear of the slow ~0.2 Hz oscillation that
 * vestibular guidance warns about. Under Reduce Motion it holds still.
 */
export default function Skeleton({ style, radius = 14 }) {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.7);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, opacity]);

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        { backgroundColor: theme.cardElevated, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}
