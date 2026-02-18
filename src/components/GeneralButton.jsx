import React from "react";
import { Pressable, Text, StyleSheet, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const useNativeDriver = Platform.OS !== "web";

const GeneralButton = ({
  children,
  onPress,
  disabled = false,
  fullWidth = false,
  size = "md",
  colors = ["#7C3AED", "#14B8A6"],
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

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const textSizes = {
    sm: 14,
    md: 16,
    lg: 18,
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
          // Keep sizeStyles here so the gradient fills the whole button
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.2)",
    elevation: 8,
    backgroundColor: "transparent",
  },
  fullWidth: {
    width: "100%",
  },
  pressable: {
    borderRadius: 14,
    overflow: "hidden",
    // No padding here!
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    width: "100%", // Ensures gradient fills the pressable width
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GeneralButton;
