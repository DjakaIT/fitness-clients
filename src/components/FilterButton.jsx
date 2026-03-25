import React from "react";
import { Pressable } from "react-native";
import { FunnelIcon } from "phosphor-react-native";
import { styles } from "../styles/Components/StylesFilterButton";

export default function FilterButton({ onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <FunnelIcon style={styles.icon} size={20} />
    </Pressable>
  );
}
