import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Funnel } from "phosphor-react-native";

export default function FilterButton({ onPress }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Funnel size={20} color="#7C3AED" weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});
