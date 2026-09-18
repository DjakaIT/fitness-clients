import React from "react";
import { Pressable, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import useReducedMotion from "../hooks/useReducedMotion";
import { PRESS_SCALE, SPRINGS } from "../styles/motion";
import {
  styles,
  sizeStyles,
  textSizes,
} from "../styles/Components/StylesGeneralButton";

const GeneralButton = ({
  children,
  onPress,
  disabled = false,
  fullWidth = false,
  size = "md",
  colors = ["#7C3AED", "#6D28D9"],
  style,
  textStyle,
  accessibilityLabel,
  ...rest
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();

  // Critically damped in both directions: pressing a button is not a throw, so
  // it should settle rather than wobble back.
  const springTo = (toValue) => {
    if (reducedMotion) return;
    Animated.spring(animatedScale, { toValue, ...SPRINGS.press }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        { transform: [{ scale: animatedScale }] },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => springTo(PRESS_SCALE)}
        onPressOut={() => springTo(1)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={
          accessibilityLabel ??
          (typeof children === "string" ? children : undefined)
        }
        style={[styles.pressable, disabled && styles.disabled]}
        {...rest}
      >
        <LinearGradient
          colors={disabled ? ["#9CA3AF", "#6B7280"] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {typeof children === "string" ? (
            <Text
              style={[styles.text, { fontSize: textSizes[size] }, textStyle]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export default GeneralButton;
