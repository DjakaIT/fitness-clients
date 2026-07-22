import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { PencilSimple } from "phosphor-react-native";
import { useTheme } from "../context/ThemeContext";

const ImpressionsBox = ({ value, onChangeText }) => {
  const { isDark, theme } = useTheme();

  const accent = isDark ? theme.accent : "#8B5CF6";
  const labelColor = isDark ? theme.textPrimary : "#000";
  const hintColor = isDark ? theme.textSecondary : "#4B5563";
  const inputBg = isDark ? theme.inputBg : "#F9FAFB";
  const inputBorder = isDark ? theme.border : "#E5E7EB";
  const inputText = isDark ? theme.textPrimary : "#000";
  const placeholder = isDark ? theme.textTertiary : "#9CA3AF";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PencilSimple size={20} color={accent} weight="bold" />
        <Text style={[styles.label, { color: labelColor }]}>Osvrt</Text>
      </View>
      <Text style={[styles.hint, { color: hintColor }]}>
        Što bi <Text style={{ fontWeight: "bold" }}>promijenila</Text>, ostavila{" "}
        <Text style={{ fontWeight: "bold" }}>kao i do sada</Text>,{" "}
        <Text style={{ fontWeight: "bold" }}>poboljšala</Text>?
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: inputBg, borderColor: inputBorder, color: inputText },
        ]}
        multiline
        placeholder="U proteklom tjednu sam..."
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={placeholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24, paddingBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 17, fontWeight: "bold" },

  hint: { fontSize: 14, marginTop: 10, lineHeight: 20 },
  input: {
    borderRadius: 16,
    padding: 16,
    height: 120,
    marginTop: 12,
    textAlignVertical: "top",
    borderWidth: 1,
    fontSize: 15,
  },
});

export default ImpressionsBox;
