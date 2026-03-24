import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { MagnifyingGlass } from "phosphor-react-native";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Pretraži...",
}) {
  return (
    <View style={styles.container}>
      <MagnifyingGlass size={18} color="#9CA3AF" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontFamily: "Inter_400Regular",
    paddingVertical: 0,
  },
});
