import React from "react";
import { Pressable, Text, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  styles,
  sizeStyles,
  textSizes,
} from "../styles/Components/StylesGeneralButton";

const useNativeDriver = Platform.OS !== "web";

const GeneralButton = ({
  children,
  onPress,
  disabled = false,
  fullWidth = false,
  size = "md",
  colors = ["#7C3AED", "#6D28D9"],
  style,
  textStyle,
  ...rest
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.96,
      useNativeDriver,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver,
    }).start();
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
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        // --- FIX IS HERE: REMOVED sizeStyles[size] ---
        style={({ pressed }) => [styles.pressable, disabled && styles.disabled]}
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
