import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { MagnifyingGlassIcon, XIcon } from "phosphor-react-native";
import { styles } from "../styles/Components/StylesSearchBar";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Pretraži...",
}) {
  return (
    <View style={styles.container}>
      <MagnifyingGlassIcon size={20} color="#6B7280" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={"#0e0d0f"}
      />

      {value ? (
        <Pressable onPress={() => onChangeText("")} style={styles.clearButton}>
          <XIcon size={20} color="#6B7280" style={styles.icon} />
        </Pressable>
      ) : null}
    </View>
  );
}
